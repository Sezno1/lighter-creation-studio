import { familyById } from '../data';
import { useStore } from '../store';
import ConceptImage from '../components/ConceptImage';
import ResearchBadge from '../components/ResearchBadge';

export default function Shortlist() {
  const { s, d, t } = useStore();
  const list = s.concepts.filter(c => c.shortlisted);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">⭐ {t('shortlistTitle')}</h1>
          <p className="page-sub">{t('shortlistSub')}</p>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="empty"><div className="big">⭐</div>{t('shortlistEmpty')}</div>
      ) : (
        <div className="compare">
          {list.map((c, i) => {
            const fam = familyById(c.familyId);
            return (
              <article key={c.id} className="card compare-card concept" style={{ animationDelay: `${i * 40}ms`, cursor: 'default' }}>
                <div className="concept-media" onClick={() => d({ type: 'detail', id: c.id })} style={{ cursor: 'zoom-in' }}><ConceptImage c={c} /></div>
                <div style={{ padding: '16px 16px 0' }} className="concept-row">
                  <span className="concept-name" style={{ fontSize: 16 }}>{c.name[s.lang]}</span>
                  <span className="concept-id">{c.code}</span>
                </div>
                <dl className="kv">
                  <dt>{t('family')}</dt><dd>{fam[s.lang]}</dd>
                  <dt>{t('materials')}</dt><dd>{fam.materials[s.lang]}</dd>
                  <dt>{t('palette')}</dt><dd><span className="swatches">{c.palette.map(p => <span key={p.hex} className="swatch" style={{ background: p.hex }} />)}</span></dd>
                  <dt>{t('research')}</dt><dd><ResearchBadge status={c.research} /></dd>
                  <dt>{t('provider')}</dt><dd>{c.provider}</dd>
                </dl>
                <div className="compare-actions">
                  <button className="btn sm brass" style={{ flex: 1 }} onClick={() => d({ type: 'viewsFor', id: c.id })}>🔄 {t('views')}</button>
                  <button className="btn sm" style={{ flex: 1 }} onClick={() => d({ type: 'toggleShortlist', ids: [c.id], value: false })}>✕ {t('unshortlist')}</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
