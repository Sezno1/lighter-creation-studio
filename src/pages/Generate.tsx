import { useEffect, useState } from 'react';
import { PROVIDERS } from '../data';
import { useStore } from '../store';
import type { Key } from '../i18n';
import Select from '../components/Select';

const LEVELS = ['🧱', '🪨', '⚖️', '🎨', '🚀'];
const ROLES: { role: 'draft' | 'final' | 'views' | 'brain'; key: Key }[] = [
  { role: 'draft', key: 'role_draft' }, { role: 'final', key: 'role_final' }, { role: 'views', key: 'role_views' }, { role: 'brain', key: 'role_brain' }
];

export default function Generate() {
  const { s, d, t } = useStore();
  const [count, setCount] = useState(48);
  const [creativity, setCreativity] = useState(2);
  const [diversity, setDiversity] = useState(70);

  const draft = PROVIDERS.draft.find(p => p.id === s.roles.draft)!;
  const cost = count * (draft.perImageCny ?? 0);
  const overCap = s.spendCny + cost > s.capCny;
  const running = s.jobs.some(j => j.status === 'running');

  // Mock progress for running jobs.
  useEffect(() => {
    const live = s.jobs.filter(j => j.status === 'running');
    if (!live.length) return;
    const id = setInterval(() => live.forEach(j => d({ type: 'jobTick', id: j.id })), 260);
    return () => clearInterval(id);
  }, [s.jobs, d]);

  const start = () => {
    d({ type: 'jobStart', job: { id: `B-${String(s.jobs.length + 1).padStart(2, '0')}`, total: count, done: 0, status: 'running', model: draft.label, startedAt: Date.now(), costCny: cost } });
    d({ type: 'toast', text: `✨ ${count} ${t('images')} · ${draft.label}` });
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">✨ {t('generateTitle')}</h1>
          <p className="page-sub">{t('generateSub')}</p>
        </div>
      </div>

      <div className="gen-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section className="card panel">
            <h3 className="panel-title">🎛️ {t('batchSize')}: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span></h3>
            <input className="range" type="range" min={4} max={100} step={4} value={count} onChange={e => setCount(+e.target.value)} style={{ '--pct': `${((count - 4) / 96) * 100}%` } as React.CSSProperties} />
            <div className="range-labels"><span>4</span><span>50</span><span>100</span></div>
          </section>

          <section className="card panel">
            <h3 className="panel-title">💡 {t('creativity')}</h3>
            <div className="level-dots">
              {LEVELS.map((e, i) => <button key={i} className={creativity === i ? 'on' : ''} onClick={() => setCreativity(i)} title={String(i + 1)}>{e}</button>)}
            </div>
            <div className="range-labels" style={{ marginTop: 8 }}><span>{t('c1')}</span><span>{t('c3')}</span><span>{t('c5')}</span></div>
          </section>

          <section className="card panel">
            <h3 className="panel-title">🧬 {t('diversity')}</h3>
            <input className="range" type="range" min={0} max={100} value={diversity} onChange={e => setDiversity(+e.target.value)} style={{ '--pct': `${diversity}%` } as React.CSSProperties} />
            <div className="range-labels"><span>{t('d_low')}</span><span>{t('d_high')}</span></div>
          </section>

          <section className="card panel">
            <h3 className="panel-title">🤖 {t('modelFor')}</h3>
            {ROLES.map(r => (
              <div className="role-row" key={r.role}>
                <span style={{ color: 'var(--ink-2)' }}>{t(r.key)}</span>
                <Select value={s.roles[r.role]} onChange={v => d({ type: 'role', role: r.role, provider: v })} width="100%"
                  options={PROVIDERS[r.role].map(p => ({ value: p.id, label: `${p.origin === 'CN' ? '🇨🇳' : '🌐'} ${p.label}`, hint: p.perImageCny ? `¥${p.perImageCny}/${s.lang === 'zh' ? '张' : 'img'}` : undefined }))} />
              </div>
            ))}
            <p className="hint" style={{ margin: '12px 0 0' }}>🛟 {t('fallbackNote')}</p>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 0 }}>
          <section className="card panel">
            <h3 className="panel-title">🧾 {t('estCost')}</h3>
            <div className="estimate">
              <span className="num">¥{cost.toFixed(2)}</span>
              <span className="hint">{count} {t('images')} × ¥{draft.perImageCny} · {draft.label}</span>
            </div>
            <div className="notice" style={{ marginBottom: 16 }}><span>🤍</span><span>{t('backgroundRule')}</span></div>
            <button className="btn brass" style={{ width: '100%', height: 44 }} onClick={start} disabled={overCap || running}>✨ {t('start')}</button>
            {overCap && <p className="hint" style={{ color: 'var(--danger)', marginBottom: 0 }}>{t('monthlyCap')} ¥{s.capCny}</p>}
          </section>

          <section className="card">
            <h3 className="panel-title" style={{ padding: '24px 24px 0' }}>📋 {t('jobs')}</h3>
            {s.jobs.length === 0 && <p className="hint" style={{ padding: '0 24px 24px', margin: 0 }}>{t('noJobs')}</p>}
            {s.jobs.map(j => {
              const pct = Math.round((j.done / j.total) * 100);
              return (
                <div className="job" key={j.id}>
                  <div className="job-row">
                    <b>{j.id} · {j.model}</b>
                    <span className={`badge ${j.status === 'done' ? 'b-ok' : j.status === 'cancelled' ? 'b-neutral' : 'b-brass'}`}>{t(j.status)}</span>
                  </div>
                  <div className={`progress ${j.status === 'done' ? 'done' : ''}`}><span style={{ width: `${pct}%` }} /></div>
                  <div className="job-row hint">
                    <span>{j.done}/{j.total} {t('images')}</span>
                    {j.status === 'running' ? <button className="btn sm ghost" onClick={() => d({ type: 'jobCancel', id: j.id })}>{t('cancel')}</button> : <span>¥{((j.costCny * j.done) / j.total).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </section>
        </aside>
      </div>
    </div>
  );
}
