import { useState, useMemo, useEffect } from 'react';
import {
  PHASES, getPhaseColors, TODAY, dayMs, addDays,
  fmtDate, fmtDateLong, avatarColor, initials,
  tasksBySquad, escapeHtml, getCSSVar, isDoingPriority, shouldExtendGanttToToday,
} from '../utils/data.js';

const DAY_W = 36;

function startOfRange() { return addDays(TODAY, -42); }
function endOfRange()   { return addDays(TODAY, 28); }
function daysBetween(a, b) { return Math.round((b - a) / dayMs); }

function TimeHeader({ days, gridTemplate }) {
  const monthGroups = [];
  let cur = null;
  days.forEach((d, i) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!cur || cur.key !== key) {
      cur = { key, label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), span: 0 };
      monthGroups.push(cur);
    }
    cur.span++;
  });
  return (
    <div className="gantt-timehead">
      <div style={{ display: 'grid', gridTemplateColumns: monthGroups.map(g => `${g.span * DAY_W}px`).join(' ') }}>
        {monthGroups.map(g => <div className="gth-month" key={g.key}>{g.label}</div>)}
      </div>
      <div className="gth-row" style={{ gridTemplateColumns: gridTemplate }}>
        {days.map((d, i) => {
          const isToday = d.toDateString() === TODAY.toDateString();
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const dw = ['S','M','T','W','T','F','S'][d.getDay()];
          return (
            <div className={`gth-day${isToday ? ' today' : ''}${isWeekend ? ' weekend' : ''}`} key={i}>
              <div className="dw">{dw}</div>
              <div className="dn">{String(d.getDate()).padStart(2,'0')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseBars({ task, rangeStart, totalDays, onTip }) {
  const segs = task.phases.map((p, i) => {
    const isLast = i === task.phases.length - 1;
    const end = isLast && shouldExtendGanttToToday(task) && p.end < TODAY ? TODAY : p.end;
    const startOffset = Math.max(0, daysBetween(rangeStart, p.start));
    const endOffset = Math.min(totalDays, daysBetween(rangeStart, end));
    const width = Math.max(0, endOffset - startOffset);
    return { ...p, end, startOffset, width, isFirst: i === 0, isLast };
  }).filter(s => s.width > 0);

  if (!segs.length) return null;
  const left = segs[0].startOffset * DAY_W;
  const totalWidth = segs.reduce((sum, s) => sum + s.width * DAY_W, 0);

  return (
    <div className="phase-track" style={{ left, width: totalWidth }}>
      {segs.map((s, i) => {
        const pal = getPhaseColors(s.phase);
        return (
          <div
            key={i}
            className={`phase-bar${s.isFirst ? ' first' : ''}${s.isLast ? ' last' : ''}`}
            style={{ flex: `0 0 ${s.width * DAY_W}px`, background: pal.bg, color: pal.ink }}
            onMouseEnter={e => onTip(e, { phase: s.phase, start: s.start, end: s.end, task: task.name, status: task.status })}
            onMouseMove={e => onTip(e, { phase: s.phase, start: s.start, end: s.end, task: task.name, status: task.status })}
            onMouseLeave={() => onTip(null)}
          >
            {s.width >= 3 ? s.phase : ''}
          </div>
        );
      })}
    </div>
  );
}

export default function Gantt({ squad, features }) {
  const [priorityFilter, setPriorityFilter] = useState('All');
  const groups = useMemo(() => {
    const squadGroups = tasksBySquad(squad, features);
    if (priorityFilter === 'Doing') {
      return squadGroups
        .map(group => ({ ...group, tasks: group.tasks.filter(isDoingPriority) }))
        .filter(group => group.tasks.length > 0);
    }
    return squadGroups;
  }, [squad, features, priorityFilter]);
  const [collapsed, setCollapsed] = useState({});
  const rangeStart = startOfRange();
  const totalDays = daysBetween(rangeStart, endOfRange());
  const days = useMemo(() => Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i)), [totalDays]);
  const gridTemplate = `repeat(${totalDays}, ${DAY_W}px)`;
  const totalWidth = totalDays * DAY_W;
  const todayOffset = daysBetween(rangeStart, TODAY) * DAY_W + DAY_W / 2;
  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);

  const [tip, setTip] = useState(null);

  useEffect(() => {
    const el = document.getElementById('tip');
    if (!el) return;
    if (tip) {
      el.classList.add('show');
      el.style.left = `${tip.x + 14}px`;
      el.style.top = `${tip.y + 14}px`;
      const pal = getPhaseColors(tip.phase);
      el.innerHTML = `
        <span class="t-phase" style="background:${getCSSVar(pal.bg)};color:${getCSSVar(pal.ink)}">${tip.phase}</span>
        <div class="t-task">${escapeHtml(tip.task)}</div>
        <div class="t-meta">${fmtDateLong(tip.start)} → ${fmtDateLong(tip.end)}</div>
        <div class="t-status">Status: <strong>${escapeHtml(tip.status)}</strong></div>
      `;
    } else {
      el.classList.remove('show');
    }
  }, [tip]);

  const onTip = (e, payload) => {
    if (!e || !payload) { setTip(null); return; }
    setTip({ x: e.clientX, y: e.clientY, ...payload });
  };

  return (
    <div className="card gantt-card" id="gantt">
      <div className="gantt-head">
        <div className="gh-l">
          <h3>Gantt <em>· progress timeline</em></h3>
          <div className="gh-sub">Phases plotted across {totalDays} days · grouped by feature</div>
        </div>
        <div className="gantt-controls">
          <div className="seg">
            <button
              className={priorityFilter === 'All' ? 'active' : ''}
              onClick={() => setPriorityFilter('All')}
            >All</button>
            <button
              className={priorityFilter === 'Doing' ? 'active' : ''}
              onClick={() => setPriorityFilter('Doing')}
            >Priority Doing</button>
          </div>
        </div>
      </div>

      <div className="gantt-body">
        <div className="gantt-left">
          <div className="glh"><span>Feature / Task</span><span>Status</span></div>
          {groups.map(group => (
            <div className={`feature-group${collapsed[group.id] ? ' collapsed' : ''}`} key={group.id}>
              <div className="feature-row" onClick={() => setCollapsed(c => ({ ...c, [group.id]: !c[group.id] }))}>
                <span className="chev">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="feature-name">{group.name}</span>
                <span className="feature-count">{group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}</span>
              </div>
              {!collapsed[group.id] && group.tasks.map(t => {
                const pal = getPhaseColors(t.status);
                return (
                  <div className="task-row" key={t.id}>
                    <div className="task-info">
                      <div className="task-name">{t.name}</div>
                      <div className="task-meta">
                        <span className="avatar" style={{ background: avatarColor(t.assignee) }}>{initials(t.assignee)}</span>
                        <span>{t.assignee}{t.priority ? ` - ${t.priority}` : ''}</span>
                      </div>
                    </div>
                    <div className="badge" style={{ background: pal.bg, color: pal.ink }}>{t.status}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="gantt-right">
          <div style={{ width: totalWidth, position: 'relative' }}>
            <TimeHeader days={days} gridTemplate={gridTemplate} />
            <div className="gantt-rows-bg" style={{ position: 'relative' }}>
              <div className="day-grid" style={{ gridTemplateColumns: gridTemplate, position: 'absolute', inset: 0, display: 'grid', pointerEvents: 'none' }}>
                {days.map((d, i) => {
                  const isToday = d.toDateString() === TODAY.toDateString();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return <div key={i} className={`${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`} />;
                })}
              </div>
              <div className="today-line" style={{ left: todayOffset }} />
              {groups.map(group => (
                <div key={group.id}>
                  <div className="feature-bar-row" />
                  {!collapsed[group.id] && group.tasks.map(t => (
                    <div className="gr" key={t.id}>
                      <PhaseBars task={t} rangeStart={rangeStart} totalDays={totalDays} onTip={onTip} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gantt-foot">
        <div className="legend">
          <span style={{ fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginRight: 8 }}>Phases</span>
          {Object.keys(PHASES).map(name => (
            <span className="legend-item" key={name}>
              <span className="legend-swatch" style={{ background: PHASES[name].bg }} />
              {name}
            </span>
          ))}
        </div>
        <div className="gf-stats">
          <div className="gf-stat">Range<strong>{totalDays} days</strong></div>
          <div className="gf-stat">Visible Tasks<strong>{totalTasks}</strong></div>
          <div className="gf-stat">Today<strong>{fmtDateLong(TODAY)}</strong></div>
        </div>
      </div>
    </div>
  );
}
