import type { Concept } from '../data';
import { familyById } from '../data';
import { useStore } from '../store';
import ConceptImage from './ConceptImage';
import MoveMenu from './MoveMenu';
import { DND } from './Sidebar';

export function useConceptActions(c: Concept, order: string[]) {
  const { s, d } = useStore();
  const selected = s.selected.includes(c.id);
  return {
    selected,
    open: () => (s.selected.length ? d({ type: 'toggleSelect', id: c.id }) : d({ type: 'detail', id: c.id, order })),
    dragStart: (e: React.DragEvent) => {
      const ids = selected ? s.selected : [c.id];
      e.dataTransfer.setData(DND, JSON.stringify(ids));
      e.dataTransfer.effectAllowed = 'move';
    }
  };
}

export default function ConceptCard({ c, index, order }: { c: Concept; index: number; order: string[] }) {
  const { s, d, t } = useStore();
  const { selected, open, dragStart } = useConceptActions(c, order);
  const fam = familyById(c.familyId);
  const folder = s.folders.find(f => f.id === c.folderId);
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <article className={`concept ${selected ? 'selected' : ''}`} style={{ animationDelay: `${Math.min(index, 16) * 24}ms` }}
      onClick={open} draggable onDragStart={dragStart} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') open(); if (e.key === ' ') { e.preventDefault(); d({ type: 'toggleSelect', id: c.id }); } }}>
      <div className="concept-media">
        <ConceptImage c={c} />
        <button className="concept-check" aria-label="select" onClick={stop(() => d({ type: 'toggleSelect', id: c.id }))}>{selected ? '✓' : ''}</button>
        <div className="concept-flags">
          {c.liked && <span className="flag" title={t('liked')}>❤️</span>}
          {c.shortlisted && <span className="flag" title={t('shortlisted')}>⭐</span>}
          {c.note && <span className="flag" title={c.note}>📝</span>}
        </div>
        <div className="concept-actions" onClick={e => e.stopPropagation()}>
          <button className={`icon-btn ${c.liked ? 'on' : ''}`} title={t('like')} onClick={() => d({ type: 'toggleLike', id: c.id })}>{c.liked ? '❤️' : '🤍'}</button>
          <button className={`icon-btn ${c.shortlisted ? 'on' : ''}`} title={c.shortlisted ? t('unshortlist') : t('shortlist')} onClick={() => d({ type: 'toggleShortlist', ids: [c.id] })}>⭐</button>
          <MoveMenu ids={[c.id]} align="left" trigger={<span className="icon-btn" title={t('moveTo')}>📁</span>} />
          <button className="icon-btn" title={t('addToChat')} onClick={() => { if (!selected) d({ type: 'toggleSelect', id: c.id }); d({ type: 'chatOpen', open: true }); }}>💬</button>
          <button className="icon-btn" title={t('views')} onClick={() => d({ type: 'viewsFor', id: c.id })}>🔄</button>
        </div>
      </div>
      <div className="concept-body">
        <div className="concept-row">
          <span className="concept-name" title={c.name[s.lang]}>{c.name[s.lang]}</span>
          <span className="concept-id">{c.code}</span>
        </div>
        <div className="concept-row">
          <span className="concept-meta">{s.scope === null ? (folder ? `${folder.emoji} ${folder.name}` : `📥 ${t('unfiled')}`) : fam[s.lang]}</span>
          <span className="swatches">{c.palette.map(p => <span key={p.hex} className="swatch" style={{ background: p.hex }} title={`${p.name} ${p.hex}`} />)}</span>
        </div>
      </div>
    </article>
  );
}

export function ConceptRow({ c, order }: { c: Concept; order: string[] }) {
  const { s, d, t } = useStore();
  const { selected, open, dragStart } = useConceptActions(c, order);
  const folder = s.folders.find(f => f.id === c.folderId);
  return (
    <tr className={`row ${selected ? 'selected' : ''}`} onClick={open} draggable onDragStart={dragStart}>
      <td onClick={e => { e.stopPropagation(); d({ type: 'toggleSelect', id: c.id }); }} style={{ width: 44 }}>
        <span className={`row-check ${selected ? 'on' : ''}`}>{selected ? '✓' : ''}</span>
      </td>
      <td style={{ width: 72 }}><span className="row-thumb"><ConceptImage c={c} /></span></td>
      <td><div className="concept-name">{c.name[s.lang]}</div><div className="hint">{c.name[s.lang === 'zh' ? 'en' : 'zh']}</div></td>
      <td className="mono hint">{c.code}</td>
      <td>{folder ? `${folder.emoji} ${folder.name}` : <span className="hint">📥 {t('unfiled')}</span>}</td>
      <td className="hint">{familyById(c.familyId)[s.lang]}</td>
      <td><span className="swatches">{c.palette.map(p => <span key={p.hex} className="swatch" style={{ background: p.hex }} />)}</span></td>
      <td className="hint">{new Date(c.createdAt).toLocaleDateString(s.lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</td>
      <td onClick={e => e.stopPropagation()}>
        <div className="row-actions">
        <button className="icon-btn" onClick={() => d({ type: 'toggleLike', id: c.id })}>{c.liked ? '❤️' : '🤍'}</button>
        <button className={`icon-btn ${c.shortlisted ? 'on' : ''}`} onClick={() => d({ type: 'toggleShortlist', ids: [c.id] })}>{c.shortlisted ? '⭐' : '☆'}</button>
        <MoveMenu ids={[c.id]} trigger={<span className="icon-btn">📁</span>} />
        </div>
      </td>
    </tr>
  );
}
