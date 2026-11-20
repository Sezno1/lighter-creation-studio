import { sortConcepts, useStore } from '../store';
import ConceptImage from '../components/ConceptImage';

export default function Home() {
  const { s, d, t } = useStore();
  const recent = sortConcepts(s.concepts, 'newest', s.lang).slice(0, 6);
  const order = recent.map(c => c.id);
  const stats = [
    { emoji: '🖼️', label: t('statConcepts'), value: s.concepts.length, go: () => d({ type: 'scope', scope: null }) },
    { emoji: '⭐', label: t('statShortlisted'), value: s.concepts.filter(c => c.shortlisted).length, go: () => d({ type: 'page', page: 'shortlist' }) },
    { emoji: '📁', label: t('statFolders'), value: s.folders.length, go: () => d({ type: 'scope', scope: null }) },
    { emoji: '💰', label: t('statSpend'), value: `¥${s.spendCny.toFixed(1)}`, go: () => d({ type: 'page', page: 'settings' }) }
  ];
  const unfiled = s.concepts.filter(c => !c.folderId).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('homeHello')}</h1>
          <p className="page-sub">{t('homeSub')}</p>
        </div>
        <button className="btn brass" onClick={() => d({ type: 'page', page: 'generate' })}>✨ {t('nav_generate')}</button>
      </div>

      <div className="stats">
        {stats.map(x => (
          <button key={x.label} className="stat card" onClick={x.go}>
            <span className="stat-emoji">{x.emoji}</span>
            <span className="stat-value">{x.value}</span>
            <span className="stat-label">{x.label}</span>
          </button>
        ))}
      </div>

      <div className="home-grid">
        <section className="card panel">
          <div className="panel-head">
            <h3 className="panel-title">🕘 {t('recent')}</h3>
            <button className="link-btn" onClick={() => d({ type: 'scope', scope: null })}>{t('seeAll')} →</button>
          </div>
          {recent.length === 0 ? <div className="empty small">{t('noDesigns')}</div> : (
            <div className="recent-grid">
              {recent.map(c => (
                <button key={c.id} className="recent" onClick={() => d({ type: 'detail', id: c.id, order })}>
                  <span className="recent-img"><ConceptImage c={c} /></span>
                  <span className="recent-name">{c.name[s.lang]}</span>
                  <span className="hint mono">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="home-side">
          <section className="card panel">
            <div className="panel-head">
              <h3 className="panel-title">📁 {t('statFolders')}</h3>
              <button className="link-btn" onClick={() => d({ type: 'folderDialog', dialog: { mode: 'create' } })}>＋ {t('newFolder')}</button>
            </div>
            <div className="folder-list">
              <button className="folder-tile" onClick={() => d({ type: 'scope', scope: 'unfiled' })}><span>📥</span><b>{t('unfiled')}</b><span className="nav-count">{unfiled}</span></button>
              {s.folders.map(f => (
                <button key={f.id} className="folder-tile" onClick={() => d({ type: 'scope', scope: f.id })}>
                  <span>{f.emoji}</span><b>{f.name}</b><span className="nav-count">{s.concepts.filter(c => c.folderId === f.id).length}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card panel">
            <h3 className="panel-title">💡 {t('tips')}</h3>
            <ul className="tips">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
