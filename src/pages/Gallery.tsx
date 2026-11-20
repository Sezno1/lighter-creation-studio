import { useMemo, useState } from 'react';
import { FAMILIES, familyById } from '../data';
import { searchText, sortConcepts, useStore, type SortKey } from '../store';
import ConceptCard, { ConceptRow } from '../components/ConceptCard';
import MoveMenu from '../components/MoveMenu';
import Popover from '../components/Popover';
import Select from '../components/Select';

type Filter = 'all' | 'liked' | 'shortlisted';

export default function Gallery() {
  const { s, d, t } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [family, setFamily] = useState('');
  const [q, setQ] = useState('');

  const folder = s.folders.find(f => f.id === s.scope);
  const inScope = useMemo(() => s.concepts.filter(c => (s.scope === null ? true : s.scope === 'unfiled' ? !c.folderId : c.folderId === s.scope)), [s.concepts, s.scope]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const fam = (id: string) => `${familyById(id).en} ${familyById(id).zh}`;
    const filtered = inScope
      .filter(c => filter === 'all' || (filter === 'liked' ? c.liked : c.shortlisted))
      .filter(c => !family || c.familyId === family)
      .filter(c => !needle || searchText(c, s.folders, fam).includes(needle));
    return sortConcepts(filtered, s.sort, s.lang);
  }, [inScope, filter, family, q, s.sort, s.lang, s.folders]);

  const order = list.map(c => c.id);
  const count = (f: Filter) => inScope.filter(c => f === 'all' || (f === 'liked' ? c.liked : c.shortlisted)).length;
  const families = FAMILIES.filter(f => inScope.some(c => c.familyId === f.id));
  const allSelected = list.length > 0 && list.every(c => s.selected.includes(c.id));
  const narrowed = filter !== 'all' || family || q;

  const title = s.scope === null ? `🖼️ ${t('allDesigns')}` : s.scope === 'unfiled' ? `📥 ${t('unfiled')}` : `${folder?.emoji} ${folder?.name}`;

  return (
    <div className={`page ${s.selected.length ? 'selecting' : ''}`}>
      <div className="page-head">
        <div>
          <h1 className="page-title">{title} <span className="title-count">{inScope.length}</span></h1>
          <p className="page-sub">{t('gallerySub')}</p>
        </div>
        {folder && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm" onClick={() => d({ type: 'folderDialog', dialog: { mode: 'rename', folderId: folder.id } })}>✏️ {t('rename')}</button>
            <button className="btn sm" onClick={() => d({ type: 'confirmDelete', id: folder.id })}>🗑️ {t('delete')}</button>
          </div>
        )}
      </div>

      <div className="toolbar">
        <div className="search"><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')} />{q && <button className="search-clear" onClick={() => setQ('')}>✕</button>}</div>
        <div className="chips">
          {(['all', 'liked', 'shortlisted'] as Filter[]).map(f => (
            <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
              {f === 'liked' ? '❤️ ' : f === 'shortlisted' ? '⭐ ' : ''}{t(f)} <span className="n">{count(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subbar">
        <button className="link-btn" disabled={!list.length} onClick={() => d(allSelected ? { type: 'clearSelect' } : { type: 'selectMany', ids: order })}>
          {allSelected ? `✕ ${t('clear')}` : `☑️ ${t('selectAll')}`}
        </button>
        {narrowed ? <span className="hint">{list.length} {t('results')} · <button className="link-btn" onClick={() => { setFilter('all'); setFamily(''); setQ(''); }}>{t('clear')}</button></span> : null}
        <span className="spacer" />
        {families.length > 1 && (
          <Select ariaLabel={t('family')} value={family} onChange={setFamily} width={150}
            options={[{ value: '', label: `🧩 ${t('allFamilies')}` }, ...families.map(f => ({ value: f.id, label: f[s.lang] }))]} />
        )}
        <Select ariaLabel={t('sortBy')} value={s.sort} onChange={v => d({ type: 'sort', sort: v as SortKey })} width={132} align="right"
          options={[{ value: 'newest', label: `↓ ${t('newest')}` }, { value: 'oldest', label: `↑ ${t('oldest')}` }, { value: 'name', label: `🔤 ${t('nameAZ')}` }, { value: 'family', label: `🧩 ${t('byFamily')}` }]} />
        {s.layout === 'grid' && (
          <div className="seg" title={t('cardSizeLabel')}>
            {(['s', 'm', 'l'] as const).map(z => <button key={z} className={s.cardSize === z ? 'on' : ''} onClick={() => d({ type: 'cardSize', size: z })}><span className={`sz sz-${z}`} /></button>)}
          </div>
        )}
        <div className="seg">
          <button className={s.layout === 'grid' ? 'on' : ''} onClick={() => d({ type: 'layout', layout: 'grid' })} title={t('gridView')}>▦</button>
          <button className={s.layout === 'list' ? 'on' : ''} onClick={() => d({ type: 'layout', layout: 'list' })} title={t('listView')}>☰</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="big">{inScope.length === 0 ? (folder ? folder.emoji : '🖼️') : '🔍'}</div>
          {inScope.length === 0 ? (folder || s.scope === 'unfiled' ? t('folderEmpty') : t('noDesigns')) : t('emptyFilter')}
        </div>
      ) : s.layout === 'grid' ? (
        <div className={`gallery size-${s.cardSize}`}>{list.map((c, i) => <ConceptCard key={c.id} c={c} index={i} order={order} />)}</div>
      ) : (
        <section className="card list-card">
          <table className="table">
            <thead><tr><th /><th /><th>{t('name')}</th><th>ID</th><th>{t('folder')}</th><th>{t('family')}</th><th>{t('palette')}</th><th>{t('date')}</th><th /></tr></thead>
            <tbody>{list.map(c => <ConceptRow key={c.id} c={c} order={order} />)}</tbody>
          </table>
        </section>
      )}

      <div className={`selection-bar ${s.selected.length ? 'show' : ''}`}>
        <span className="count">{s.selected.length} {t('selected')}</span>
        <MoveMenu ids={s.selected} align="left" className="up" trigger={<span className="btn sm">📁 {t('moveTo')}</span>} />
        <button className="btn sm" onClick={() => d({ type: 'chatOpen', open: true })}>💬 {t('addToChat')}</button>
        <button className="btn sm" onClick={() => { d({ type: 'toggleShortlist', ids: s.selected, value: true }); d({ type: 'toast', text: `⭐ ${s.selected.length}` }); }}>⭐ {t('shortlist')}</button>
        <Popover align="left" className="up" trigger={<span className="btn sm">⋯</span>}>
          {close => (
            <>
              <button className="menu-item" onClick={() => { close(); s.selected.forEach(id => { const c = s.concepts.find(x => x.id === id); if (c && !c.liked) d({ type: 'toggleLike', id }); }); }}>❤️ {t('like')}</button>
              <button className="menu-item" onClick={() => { close(); d({ type: 'toggleShortlist', ids: s.selected, value: false }); }}>☆ {t('unshortlist')}</button>
              <button className="menu-item" onClick={() => { close(); d({ type: 'viewsFor', id: s.selected[0] }); }}>🔄 {t('views')}</button>
            </>
          )}
        </Popover>
        <button className="btn sm ghost" style={{ color: '#fff' }} onClick={() => d({ type: 'clearSelect' })}>✕ {t('clear')}</button>
      </div>
    </div>
  );
}
