import { familyById, PROVIDERS, type ViewKey, type ViewState } from '../data';
import { useStore } from '../store';
import ConceptImage from '../components/ConceptImage';
import type { Key } from '../i18n';

const VIEWS: { key: ViewKey; emoji: string }[] = [
  { key: 'front', emoji: '🟫' }, { key: 'three_q', emoji: '🔷' }, { key: 'side', emoji: '▮' },
  { key: 'back', emoji: '🔙' }, { key: 'top', emoji: '⬆️' }, { key: 'open', emoji: '📂' }
];
const BADGE: Record<ViewState, string> = { original: 'b-brass', ok: 'b-ok', drift: 'b-warn', todo: 'b-neutral', working: 'b-info' };

export default function Views() {
  const { s, d, t } = useStore();
  const picked = s.concepts.filter(c => c.shortlisted || c.id === s.viewsFor);
  const candidates = picked.length ? picked : s.concepts;
  const c = s.concepts.find(x => x.id === s.viewsFor) ?? candidates[0];
  const provider = PROVIDERS.views.find(p => p.id === s.roles.views)!;
  const todo = c ? VIEWS.filter(v => !c.views[v.key] || c.views[v.key] === 'todo') : [];

  const makeAll = () => {
    if (!c) return;
    todo.forEach((v, i) => {
      d({ type: 'setView', id: c.id, view: v.key, state: 'working' });
      setTimeout(() => d({ type: 'setView', id: c.id, view: v.key, state: v.key === 'top' ? 'drift' : 'ok' }), 1100 + i * 500);
    });
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">🔄 {t('viewsTitle')}</h1>
          <p className="page-sub">{t('viewsSub')}</p>
        </div>
      </div>

      <div className="views-layout">
        <section className="card">
          <h3 className="panel-title" style={{ padding: '24px 24px 0', marginBottom: 8 }}>{t('pickConcept')}</h3>
          <div className="picker">
            {candidates.map(x => (
              <button key={x.id} className={`pick ${c?.id === x.id ? 'on' : ''}`} onClick={() => d({ type: 'viewsFor', id: x.id })}>
                <span className="pick-thumb"><ConceptImage c={x} /></span>
                <span style={{ minWidth: 0 }}>
                  <div className="concept-name">{x.name[s.lang]}</div>
                  <div className="concept-id">{x.code}</div>
                </span>
              </button>
            ))}
          </div>
        </section>

        {c && (
          <section>
            <div className="design-card-box">
              <b style={{ color: 'var(--ink)' }}>📇 {t('designCard')} · {c.code}</b><br />
              {familyById(c.familyId)[s.lang]} · {familyById(c.familyId).materials[s.lang]} · {c.palette.map(p => p.name).join(' / ')}
            </div>
            <div className="toolbar" style={{ marginBottom: 16 }}>
              <span className="hint">🤖 {provider.label} · {t('estCost')} ¥{(todo.length * 3 * (provider.perImageCny ?? 0)).toFixed(2)}</span>
              <span className="spacer" />
              <button className="btn brass" disabled={!todo.length} onClick={makeAll}>🔄 {t('makeViews')} ({todo.length})</button>
            </div>
            <div className="view-grid">
              {VIEWS.map(v => {
                const st: ViewState = c.views[v.key] ?? 'todo';
                return (
                  <div className="view-slot" key={v.key}>
                    <div className={`view-media ${st === 'todo' ? 'todo' : ''} ${st === 'working' ? 'working' : ''}`}>
                      {st === 'todo' ? <span className="view-empty"><span className="view-empty-icon">📷</span><span>{t('vs_todo')}</span></span> : <ConceptImage c={c} />}
                    </div>
                    <div className="view-foot">
                      <span>{t(`v_${v.key}` as Key)}</span>
                      <span className={`badge ${BADGE[st]}`}>{t(`vs_${st}` as Key)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
