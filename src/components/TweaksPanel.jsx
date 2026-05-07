import { useState, useEffect, useCallback } from 'react';

const STYLE = `
.twk-panel{position:fixed;right:16px;bottom:16px;z-index:9999;width:280px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:rgba(250,249,247,.92);color:#29261b;backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);border:.5px solid rgba(255,255,255,.6);border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none;border-bottom:.5px solid rgba(0,0,0,.08)}
.twk-hd b{font-size:12px;font-weight:600}
.twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:15px;line-height:1;display:grid;place-items:center}
.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
.twk-body{padding:10px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto}
.twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(41,38,27,.5);padding:4px 0 2px;border-bottom:.5px solid rgba(0,0,0,.08);margin-bottom:2px}
.twk-row{display:flex;flex-direction:column;gap:5px}
.twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72);font-size:11px}
.twk-lbl>span:first-child{font-weight:500}
.twk-color-grid{display:flex;flex-wrap:wrap;gap:6px}
.twk-swatch{width:28px;height:28px;border-radius:8px;cursor:pointer;border:2px solid transparent;transition:.15s;position:relative}
.twk-swatch.active{border-color:#29261b}
.twk-swatch.palette{width:52px;height:22px;border-radius:6px;display:flex;overflow:hidden;gap:0}
.twk-swatch.palette span{flex:1}
.twk-toggle-track{width:36px;height:20px;border-radius:999px;background:rgba(0,0,0,.12);cursor:pointer;position:relative;transition:.2s;border:0;appearance:none;flex-shrink:0}
.twk-toggle-track.on{background:#29261b}
.twk-toggle-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:white;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.twk-toggle-track.on .twk-toggle-thumb{left:18px}
.twk-row-h{flex-direction:row;align-items:center;justify-content:space-between}
`;

function injectStyle() {
  if (document.getElementById('twk-style')) return;
  const s = document.createElement('style');
  s.id = 'twk-style';
  s.textContent = STYLE;
  document.head.appendChild(s);
}

function TweakSection({ title }) {
  return <div className="twk-sect">{title}</div>;
}

function TweakColor({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div className="twk-color-grid">
        {options.map((opt, i) => {
          const isArr = Array.isArray(opt);
          const isActive = JSON.stringify(value) === JSON.stringify(opt);
          if (isArr) {
            return (
              <div key={i} className={`twk-swatch palette${isActive ? ' active' : ''}`} onClick={() => onChange(opt)} title={opt.join(', ')}>
                {opt.map((c, j) => <span key={j} style={{ background: c }} />)}
              </div>
            );
          }
          return (
            <div key={i} className={`twk-swatch${isActive ? ' active' : ''}`} style={{ background: opt }} onClick={() => onChange(opt)} title={opt} />
          );
        })}
      </div>
    </div>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <span className="twk-lbl"><span>{label}</span></span>
      <button className={`twk-toggle-track${value ? ' on' : ''}`} onClick={() => onChange(!value)}>
        <div className="twk-toggle-thumb" />
      </button>
    </div>
  );
}

export default function TweaksPanel({ title, tweaks, setTweak }) {
  const [open, setOpen] = useState(true);

  useEffect(() => { injectStyle(); }, []);

  // Apply body classes
  useEffect(() => {
    document.body.classList.toggle('compact', !!tweaks.compactRows);
    document.body.classList.toggle('no-pulse', !tweaks.showTodayPulse);
    document.body.classList.toggle('mono-titles', !!tweaks.monoTitles);

    // Background gradient swap
    const palette = tweaks.accent;
    if (Array.isArray(palette)) {
      const [a, b, c] = palette;
      const bg = document.querySelector('.page-bg');
      if (bg) {
        bg.style.background = `
          radial-gradient(60% 50% at 8% 0%,${a} 0%,transparent 60%),
          radial-gradient(55% 45% at 100% 10%,${b} 0%,transparent 65%),
          radial-gradient(70% 60% at 90% 95%,${c} 0%,transparent 60%),
          radial-gradient(50% 40% at 0% 100%,${a} 0%,transparent 65%),
          var(--bg-0)`;
      }
    }
  }, [tweaks]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999, width: 40, height: 40, borderRadius: '50%', background: '#1a1a1f', color: 'white', border: 0, cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center' }}
        title="Open Tweaks"
      >⚙</button>
    );
  }

  return (
    <div className="twk-panel">
      <div className="twk-hd">
        <b>{title || 'Tweaks'}</b>
        <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="twk-body">
        <TweakSection title="Theme" />
        <TweakColor
          label="Background accent"
          value={tweaks.accent}
          onChange={v => setTweak('accent', v)}
          options={[
            ['#ffe2cc','#d9e0ff','#d4f0e0'],
            ['#e9e5ff','#ffd6e3','#cfe6f7'],
            ['#fff1b8','#c9efd8','#f3d7ff'],
            ['#f7f5f1','#e6e6ec','#d1d1da'],
          ]}
        />
        <TweakSection title="Display" />
        <TweakToggle label="Today pulse marker" value={tweaks.showTodayPulse} onChange={v => setTweak('showTodayPulse', v)} />
        <TweakToggle label="Compact Gantt rows" value={tweaks.compactRows} onChange={v => setTweak('compactRows', v)} />
        <TweakToggle label="Monospace headlines" value={tweaks.monoTitles} onChange={v => setTweak('monoTitles', v)} />
      </div>
    </div>
  );
}
