// Data helpers and constants for the dashboard

export const PHASES = {
  Concept:       { bg: 'var(--p-concept-bg)',    ink: 'var(--p-concept-ink)' },
  Define:        { bg: 'var(--p-define-bg)',      ink: 'var(--p-define-ink)' },
  Wireframe:     { bg: 'var(--p-wireframe-bg)',   ink: 'var(--p-wireframe-ink)' },
  UI:            { bg: 'var(--p-ui-bg)',          ink: 'var(--p-ui-ink)' },
  Update:        { bg: 'var(--p-update-bg)',      ink: 'var(--p-update-ink)' },
  'HOD Review':  { bg: 'var(--p-hod-bg)',         ink: 'var(--p-hod-ink)' },
  'Sent to PO':  { bg: 'var(--p-sentpo-bg)',      ink: 'var(--p-sentpo-ink)' },
  'PO Pending':  { bg: 'var(--p-popending-bg)',   ink: 'var(--p-popending-ink)' },
  'Ready to Dev':{ bg: 'var(--p-readydev-bg)',    ink: 'var(--p-readydev-ink)' },
  UAT:           { bg: 'var(--p-uat-bg)',         ink: 'var(--p-uat-ink)' },
  Release:       { bg: 'var(--p-release-bg)',     ink: 'var(--p-release-ink)' },
  New:           { bg: 'var(--p-new-bg)',         ink: 'var(--p-new-ink)' },
  Doing:         { bg: 'var(--p-doing-bg)',       ink: 'var(--p-doing-ink)' },
  Blocked:       { bg: 'var(--p-blocked-bg)',     ink: 'var(--p-blocked-ink)' },
  Pending:       { bg: 'var(--p-popending-bg)',   ink: 'var(--p-popending-ink)' },
};

export function getPhaseColors(phase) {
  const direct = PHASES[phase];
  if (direct) return direct;
  // Case-insensitive fallback
  const key = Object.keys(PHASES).find(k => k.toLowerCase() === (phase || '').toLowerCase());
  if (key) return PHASES[key];
  // Hash-based pastel fallback for unknown phases
  let hash = 0;
  const p = phase || '';
  for (let i = 0; i < p.length; i++) hash = p.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { bg: `hsl(${h}, 70%, 90%)`, ink: `hsl(${h}, 80%, 30%)` };
}

export const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

export const dayMs = 24 * 60 * 60 * 1000;
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const fmtDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
export const fmtDateSheet = (d) => `${fmtDate(d)}/${d.getFullYear()}`;
export const fmtDateLong = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const AVATAR_COLORS = ['#7a5fd1', '#d75f87', '#5fa8d7', '#5fb377', '#d79f5f', '#9d5fd7', '#d76b5f'];
export const avatarColor = (name) => AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length];
export const initials = (name) => (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

export function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) return isNaN(str) ? null : str;
  if (typeof str !== 'string') {
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }
  const parts = str.split('/');
  if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  // Try ISO
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

export function formatSheetDateValue(value, fallbackDate) {
  if (typeof value === 'string' && value.trim()) {
    const raw = value.trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const first = Number(match[1]);
      const second = Number(match[2]);
      if (first <= 12) {
        return `${match[2].padStart(2, '0')}/${match[1].padStart(2, '0')}/${match[3]}`;
      }
      if (second <= 12) return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
    }
    return raw;
  }
  if (fallbackDate instanceof Date && !isNaN(fallbackDate)) return fmtDateSheet(fallbackDate);
  return '';
}

function parseSheetDisplayDate(value) {
  const match = String(value || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

const field = (obj, keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') return obj[key];
  }
  return '';
};

function getWeekLabel(d) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return 'W' + Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
}

export const norm = (value) => String(value || '').trim().toLowerCase();
export const canonicalSquad = (value) => {
  const squad = String(value || '').trim();
  return norm(squad).replace(/\s+/g, '') === 'appbase' ? 'Base' : squad;
};
export const taskPriority = (task) => task.priority || task.Priority || task.level || task.Level || '';
export const taskStatus = (task) => task.status || task.Status || '';
export const taskDescription = (task) => task.description || task.Description || task.desc || task.Desc || '';
export const isDoingPriority = (task) => norm(taskPriority(task)) === 'doing';
export const isPoPendingStatus = (task) => norm(taskStatus(task)) === 'po pending';
export const isStatus = (task, status) => norm(taskStatus(task)) === norm(status);

const GANTT_EXTEND_EXCLUDED_PRIORITIES = new Set([
  'pending',
  'level 1',
  'level 2',
  'level 3',
  'level 4',
  'release',
]);

const GANTT_EXTEND_EXCLUDED_STATUSES = new Set([
  'release',
  'hold',
  'pending',
  'new',
]);

export function shouldExtendGanttToToday(task) {
  return !GANTT_EXTEND_EXCLUDED_PRIORITIES.has(norm(taskPriority(task))) &&
    !GANTT_EXTEND_EXCLUDED_STATUSES.has(norm(taskStatus(task)));
}

export function buildDoingWeekly(tasks) {
  const thisMonday = new Date(TODAY);
  const dow = thisMonday.getDay();
  thisMonday.setDate(thisMonday.getDate() - (dow === 0 ? 6 : dow - 1));

  const doingTasks = tasks.filter(isDoingPriority);
  const WEEKLY = [];
  for (let w = 5; w >= 0; w--) {
    const mon = new Date(thisMonday);
    mon.setDate(mon.getDate() - w * 7);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);

    const current = w === 0;
    const value = current
      ? doingTasks.length
      : doingTasks.filter(task =>
        (task.phases || []).some(phase => phase.start >= mon && phase.start <= sun)
      ).length;

    WEEKLY.push({ label: getWeekLabel(mon), value, current });
  }
  return WEEKLY;
}

/** Transform raw GAS JSON → { SQUADS, FEATURES, WEEKLY, GOLIVE, lastUpdated } */
export function parseGasData(gasData) {
  const rawTasks = gasData.tasks || [];

  // SQUADS
  const squadSet = new Set(rawTasks.map(t => canonicalSquad(t.squad)).filter(Boolean));
  const SQUADS = ['All', ...Array.from(squadSet).sort()];

  // FEATURES / TASKS
  const featureMap = {};
  let fid = 1, tid = 1;
  rawTasks.forEach(t => {
    const fname = t.feature || 'Uncategorised';
    const priority = taskPriority(t);
    const squad = canonicalSquad(t.squad) || 'Unknown';
    if (!featureMap[fname]) {
      featureMap[fname] = { id: 'f' + fid++, name: fname, squad, tasks: [] };
    }

    // Build phases from dates object
    const phases = [];
    if (t.dates && typeof t.dates === 'object') {
      const entries = Object.entries(t.dates)
        .map(([k, v]) => ({ phase: k, start: parseDate(v) }))
        .filter(x => x.start !== null)
        .sort((a, b) => a.start - b.start);

      for (let i = 0; i < entries.length; i++) {
        const end = i < entries.length - 1 ? entries[i + 1].start : addDays(entries[i].start, 3);
        phases.push({ phase: entries[i].phase, start: entries[i].start, end });
      }
    }

    featureMap[fname].tasks.push({
      id: 't' + tid++,
      name: t.task || 'Unnamed Task',
      assignee: t.designer || t.po || t.pm || 'Unknown',
      squad,
      status: taskStatus(t) || 'New',
      priority,
      description: taskDescription(t),
      phases,
    });
  });

  const FEATURES = Object.values(featureMap);

  // WEEKLY — count active tasks per week (last 6 weeks)
  const thisMonday = new Date(TODAY);
  const dow = thisMonday.getDay();
  thisMonday.setDate(thisMonday.getDate() - (dow === 0 ? 6 : dow - 1));

  const WEEKLY = buildDoingWeekly(FEATURES.flatMap(f => f.tasks));

  // GOLIVE — Released tasks
  const sixWeeksAgo = new Date(thisMonday);
  sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 35);
  const rawGolive = gasData.golive || gasData.GoLive || gasData.GOLIVE || [];
  const GOLIVE = (rawGolive.length ? rawGolive.map(g => {
    const rawDate = field(g, ['date', 'Date', 'ngay', 'Ngay', 'ngày', 'Ngày']);
    const date = parseDate(rawDate) || TODAY;
    const displayDate = formatSheetDateValue(rawDate, date);
    return {
      type: field(g, ['type', 'Type']) || '✅ Golive',
      squad: canonicalSquad(field(g, ['squad', 'Squad'])),
      feature: field(g, ['feature', 'Feature']),
      note: field(g, ['note', 'Note']),
      ux: field(g, ['ux', 'UX']),
      date,
      displayDate,
      sortDate: parseSheetDisplayDate(displayDate) || date,
    };
  }) : rawTasks
    .filter(t => norm(taskStatus(t)) === 'release')
    .map(t => {
      let date = TODAY;
      if (t.dates) {
        const e = Object.entries(t.dates).find(([k]) => k.toLowerCase().includes('release'));
        if (e) date = parseDate(e[1]) || TODAY;
      }
      return {
        type: '✅ Golive',
        squad: canonicalSquad(t.squad),
        feature: t.feature,
        note: t.task,
        ux: t.designer || '',
        date,
        displayDate: fmtDateSheet(date),
        sortDate: date,
      };
    }))
    .filter(g => (g.sortDate || g.date) >= sixWeeksAgo)
    .sort((a, b) => (b.sortDate || b.date) - (a.sortDate || a.date));

  return {
    SQUADS,
    FEATURES,
    WEEKLY,
    GOLIVE,
    lastUpdated: gasData.lastUpdated || new Date().toLocaleTimeString('vi-VN'),
  };
}

export function tasksBySquad(squad, features) {
  if (squad === 'All') return features;
  if (Array.isArray(squad)) {
    const allowed = new Set(squad.map(s => norm(canonicalSquad(s))));
    return features
      .map(f => ({ ...f, tasks: f.tasks.filter(t => allowed.has(norm(canonicalSquad(t.squad)))) }))
      .filter(f => f.tasks.length > 0);
  }
  return features
    .map(f => ({ ...f, tasks: f.tasks.filter(t => canonicalSquad(t.squad) === canonicalSquad(squad)) }))
    .filter(f => f.tasks.length > 0);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function getCSSVar(varExpr) {
  const m = varExpr.match(/var\((--[^)]+)\)/);
  if (!m) return varExpr;
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
}
