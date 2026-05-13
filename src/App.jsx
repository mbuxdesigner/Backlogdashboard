import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseGasData, tasksBySquad, canonicalSquad, norm, buildDoingWeekly, isDoingPriority, isPoPendingStatus, isStatus } from './utils/data.js';
import Gantt from './components/Gantt.jsx';

// ── CONFIG ─────────────────────────────────────────────
// Set your Apps Script Web App URL in .env as VITE_GAS_API_URL
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || '';
// ────────────────────────────────────────────────────────

const SQUAD_GROUPS = {
  'APP MB': ['Core', 'Card', 'Base', 'Lending', 'ESaving', 'Upsale', 'Sub', 'Onboarding', 'VietQR', 'Billing', 'Partnership', 'CSOP', 'Junior'],
  Other: ['MBSeller', 'DigiTrading', 'CRM', 'Visual', 'BaaS', 'Ads Portal'],
};

// ── STAT CARDS ──────────────────────────────────────────
function StatNumber({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 52, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink-0)'
      }}>{String(value).padStart(2, '0')}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ProgressBar({ pct, variant = 'doing' }) {
  return (
    <div className={`ms-bar ${variant}`} style={{ marginTop: 8 }}>
      <span style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function LoadingSkeleton({ progress }) {
  return (
    <div>
      <div className="page-bg" aria-hidden="true" />
      <div className="load-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="app skeleton-page">
        <div className="topbar">
          <div className="sk sk-brand" />
          <div className="sk sk-action" />
        </div>
        <div className="titlerow">
          <div className="sk sk-title" />
          <div className="sk sk-subtitle" />
        </div>
        <div className="sk sk-filter" />
        <div className="overview overview-2">
          <div className="card sk-card sk-overview" />
          <div className="card sk-card sk-golive" />
        </div>
        <div className="card sk-card sk-gantt" />
      </div>
    </div>
  );
}

function CombinedStats({ appData, squad }) {
  const groups = useMemo(() => tasksBySquad(squad, appData.FEATURES), [squad, appData.FEATURES]);
  const allTasks = groups.flatMap(g => g.tasks);
  const total = allTasks.length;
  const doing = allTasks.filter(isDoingPriority).length;
  const poPending = allTasks.filter(isPoPendingStatus).length;
  const readyToDev = allTasks.filter(t => isStatus(t, 'Ready to Dev')).length;
  const uat = allTasks.filter(t => isStatus(t, 'UAT')).length;
  const weekly = useMemo(() => buildDoingWeekly(allTasks), [allTasks]);
  const lastWeek = weekly.length >= 2 ? weekly[weekly.length - 2].value : 0;
  const delta = doing - lastWeek;
  const trendCls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const trendArrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const max = Math.max(...weekly.map(w => w.value), 1);
  const totalWk = weekly.reduce((s, w) => s + w.value, 0);
  const doingPct = total ? Math.round(doing / total * 100) : 0;
  const poPct = total ? Math.round(poPending / total * 100) : 0;
  const readyPct = total ? Math.round(readyToDev / total * 100) : 0;
  const uatPct = total ? Math.round(uat / total * 100) : 0;

  return (
    <div className="card combined">
      <div className="combined-grid">
        {/* Hero */}
        <div className="cb-hero">
          <div className="hero-head">
            <div>
              <div className="h-eyebrow">Hero stat</div>
              <div className="h-title">
                Tasks currently <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>Doing</em>
              </div>
            </div>
            <span className={`trend ${trendCls}`}>
              {trendArrow} {Math.abs(delta)} vs last week
            </span>
          </div>
          <div className="hero-number">
            {String(doing).padStart(2, '0')}<small>tasks</small>
          </div>
          <div className="hero-foot">
            <div className="fl">Pipeline total <strong>{total}</strong></div>
            <div className="fl">{appData.lastUpdated}</div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="cb-weekly">
          <div className="weekly-head">
            <div>
              <div className="w-title">Weekly rhythm</div>
              <div className="w-sub">Active tasks · 6 weeks</div>
            </div>
            <div className="w-meta">
              Total<strong>{totalWk}</strong>
            </div>
          </div>
          <div className="bars">
            {weekly.map((w, i) => (
              <div className="bar-col" key={i}>
                <div className="bar-stack">
                  <div
                    className={`bar${w.current ? ' current' : ''}`}
                    style={{ height: `${(w.value / max) * 100}%` }}
                  />
                </div>
                <div className={`bar-label${w.current ? ' current' : ''}`}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini stats */}
        <div className="cb-mini">
          <div className="mini-row">
            <div className="ms-title">
              <span>In progress</span><span>Priority - Doing</span>
            </div>
            <div className="ms-value">{doing}<small>of {total}</small></div>
            <ProgressBar pct={doingPct} variant="doing" />
            <div className="ms-foot"><span>{doingPct}% of pipeline</span><span>↑ healthy</span></div>
          </div>
          <div className="mini-row">
            <div className="ms-title">
              <span>PO pending</span><span>Status - PO Pending</span>
            </div>
            <div className="ms-value">{poPending}<small>tasks waiting</small></div>
            <ProgressBar pct={poPct} variant="po" />
            <div className="ms-foot"><span>{poPct}% of pipeline</span><span>avg wait 3.2d</span></div>
          </div>
          <div className="mini-row">
            <div className="ms-title">
              <span>Ready to Dev</span><span>Status - Ready</span>
            </div>
            <div className="ms-value">{readyToDev}<small>tasks</small></div>
            <ProgressBar pct={readyPct} variant="ready" />
            <div className="ms-foot"><span>{readyPct}% of pipeline</span><span>handoff</span></div>
          </div>
          <div className="mini-row">
            <div className="ms-title">
              <span>UAT</span><span>Status - UAT</span>
            </div>
            <div className="ms-value">{uat}<small>tasks</small></div>
            <ProgressBar pct={uatPct} variant="uat" />
            <div className="ms-foot"><span>{uatPct}% of pipeline</span><span>testing</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoLive({ appData, squad }) {
  const releases = useMemo(() => {
    if (squad === 'All') return appData.GOLIVE;
    if (Array.isArray(squad)) {
      const allowed = new Set(squad.map(s => norm(canonicalSquad(s))));
      return appData.GOLIVE.filter(g => allowed.has(norm(canonicalSquad(g.squad))));
    }
    return appData.GOLIVE.filter(g => canonicalSquad(g.squad) === canonicalSquad(squad));
  }, [appData.GOLIVE, squad]);

  return (
    <div className="card golive" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="golive-head">
        <h3>GoLive <em>· last 6 weeks</em></h3>
        <span className="gh-meta">{releases.length} releases</span>
      </div>
      <div className="timeline" style={{ flex: 1 }}>
        {releases.length === 0 && (
          <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>No recent releases</div>
        )}
        {releases.map((g, i) => (
          <div className="tl-item" key={i}>
            <div className="tl-dateblock">
              <span>{g.displayDate}</span>
            </div>
            <div className="tl-axis" aria-hidden="true" />
            <div className="tl-content">
              <div className="tl-type">{g.type}</div>
              <div className="tl-feature">
                {g.squad && <span className="tl-squad">{g.squad}</span>}
                <span>{g.feature}</span>
              </div>
              {g.ux && <div className="tl-meta">UX: {g.ux}</div>}
              {g.note && <div className="tl-note">Note: {g.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [appData, setAppData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadProgress, setLoadProgress] = useState(8);
  const [squadGroup, setSquadGroup] = useState('All');
  const [squad, setSquad] = useState('All');

  const fetchData = useCallback((forceRefresh = false) => {
    setLoadProgress(forceRefresh ? 18 : 8);
    if (!GAS_API_URL) {
      // Demo/dev mode — use mock data
      import('./utils/mockData.js')
        .then(m => {
          setLoadProgress(100);
          setAppData(m.MOCK_DATA);
          setError(null);
        })
        .catch(err => setError(err.message))
        .finally(() => setRefreshing(false));
      return;
    }
    const url = `${GAS_API_URL}?page=api${forceRefresh ? '&refresh=1' : ''}`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setLoadProgress(100);
        setAppData(parseGasData(data));
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (appData || error) return;
    const id = window.setInterval(() => {
      setLoadProgress(p => Math.min(p + Math.max(1, (92 - p) * 0.14), 92));
    }, 180);
    return () => window.clearInterval(id);
  }, [appData, error]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const activeSquads = squad === 'All' ? (SQUAD_GROUPS[squadGroup] || 'All') : squad;
  const visibleSquads = SQUAD_GROUPS[squadGroup] || [];
  const chooseSquadGroup = (group) => {
    setSquadGroup(group);
    setSquad('All');
  };

  if (error) return (
    <div className="error-screen">
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2>Could not load dashboard data</h2>
      <p>{error}</p>
      {!GAS_API_URL && (
        <p style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 400, textAlign: 'center' }}>
          Set <code style={{ background: 'rgba(0,0,0,.06)', padding: '2px 6px', borderRadius: 4 }}>VITE_GAS_API_URL</code> in your <code style={{ background: 'rgba(0,0,0,.06)', padding: '2px 6px', borderRadius: 4 }}>.env</code> file to connect to Google Sheets.
        </p>
      )}
      <button
        onClick={() => { setError(null); fetchData(); }}
        style={{ marginTop: 16, padding: '10px 28px', borderRadius: 999, border: 0, background: 'var(--ink-0)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}
      >Try again</button>
    </div>
  );

  if (!appData) return <LoadingSkeleton progress={loadProgress} />;

  return (
    <div>
      <div className="page-bg" aria-hidden="true" />
      {refreshing && <div className="load-progress active"><span style={{ width: `${loadProgress}%` }} /></div>}
      <div id="tip" className="tip" role="tooltip" aria-hidden="true" />

      <div className="app">
        {/* ── Topbar ── */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">UX</div>
            <div className="brand-text">
              <div className="b1">Design Ops</div>
              <div className="b2">Task Dashboard</div>
            </div>
          </div>

          <div className="topactions">
            <div className="updated">
              <div className="l1">Last updated</div>
              <div className="l2">{appData.lastUpdated}</div>
            </div>
            <button
              className="icon-btn primary"
              onClick={onRefresh}
              title="Refresh data"
              aria-label="Refresh"
              disabled={refreshing}
            >
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.9s ease' }}
              >
                <path d="M3 8a5 5 0 018.5-3.5M13 8a5 5 0 01-8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 2v3h-3M5 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Page title ── */}
        <div className="titlerow">
          <h1 className="pagetitle">Progress <em>report</em></h1>
          <div className="subtitle">
            A live look at every design task across squads — pulled directly from the team's source-of-truth sheet.
          </div>
        </div>

        {/* ── Squad filter ── */}
        <div className="filterrow">
          <span className="filter-label">Squad</span>
          {['All', 'APP MB', 'Other'].map(group => (
            <button
              key={group}
              className={`squad-pill squad-group${squadGroup === group ? ' active' : ''}`}
              onClick={() => chooseSquadGroup(group)}
            >{group === 'All' ? 'ALL' : group}</button>
          ))}
          {visibleSquads.length > 0 && (
            <div className="squad-subgroup">
              <button
                className={`squad-pill squad-sub${squad === 'All' ? ' active' : ''}`}
                onClick={() => setSquad('All')}
              >All {squadGroup}</button>
              {visibleSquads.map(s => (
                <button
                  key={s}
                  className={`squad-pill squad-sub${squad === s ? ' active' : ''}`}
                  onClick={() => setSquad(s)}
                >{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* ── Stats + GoLive ── */}
        <div className="overview overview-2">
          <CombinedStats appData={appData} squad={activeSquads} />
          <GoLive appData={appData} squad={activeSquads} />
        </div>

        {/* ── Gantt ── */}
        <Gantt squad={activeSquads} features={appData.FEATURES} />
      </div>

    </div>
  );
}
