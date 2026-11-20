import { useEffect } from 'react';
import { familyById } from '../data';
import { useStore } from '../store';
import ConceptImage from './ConceptImage';
import ResearchBadge from './ResearchBadge';
import MoveMenu from './MoveMenu';

export default function DetailDrawer() {
  const { s, d, t } = useStore();
  const c = s.concepts.find(x => x.id === s.detailId);
  const open = !!c;
  const order = s.detailOrder.length ? s.detailOrder : s.concepts.map(x => x.id);
  const pos = c ? order.indexOf(c.id) : -1;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select') !== null;
      if (e.key === 'Escape') d({ type: 'detail', id: null });
      else if (!typing && e.key === 'ArrowRight') d({ type: 'detailStep', dir: 1 });
      else if (!typing && e.key === 'ArrowLeft') d({ type: 'detailStep', dir: -1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, d]);

  const copy = (hex: string) => { navigator.clipboard?.writeText(hex).catch(() => {}); d({ type: 'toast', text: `${t('copied')} ${hex}` }); };
  const fam = c ? familyById(c.familyId) : null;
  const folder = c ? s.folders.find(f => f.id === c.folderId) : undefined;

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => d({ type: 'detail', id: null })} />
      <aside className={`drawer ${open ? 'show' : ''}`} aria-hidden={!open}>
        {c && fam && (
          <>
            <div className="drawer-media">
              <div className="drawer-nav">
                <button className="icon-btn" onClick={() => d({ type: 'detail', id: null })} aria-label="close" title="Esc">✕</button>
                {order.length > 1 && (
                  <div className="drawer-steps">
                    <button className="icon-btn" onClick={() => d({ type: 'detailStep', dir: -1 })} title={`${t('prev')} ←`}>←</button>
                    <span className="hint mono">{pos + 1} / {order.length}</span>
                    <button className="icon-btn" onClick={() => d({ type: 'detailStep', dir: 1 })} title={`${t('next')} →`}>→</button>
                  </div>
                )}
              </div>
              <div key={c.id} className="drawer-img"><ConceptImage c={c} /></div>
            </div>
            <div className="drawer-side">
              <div className="drawer-head">
                <div className="concept-row"><span className="concept-id">{c.code} · {t('revision')} {c.rev}</span><ResearchBadge status={c.research} /></div>
                <h2>{c.name[s.lang]}</h2>
                <div className="drawer-folder">
                  <MoveMenu ids={[c.id]} align="left" trigger={<span className="folder-pill">{folder ? `${folder.emoji} ${folder.name}` : `📥 ${t('unfiled')}`} <span className="caret">▾</span></span>} />
                </div>
              </div>
              <div className="drawer-body">
                <div className="section">
                  <h4>{t('names')}</h4>
                  <div className="grid-2 tight">
                    <div className="field"><label>{t('nameZh')}</label>
                      <input className="input" value={c.name.zh} onChange={e => d({ type: 'editConcept', id: c.id, patch: { name: { ...c.name, zh: e.target.value } } })} /></div>
                    <div className="field"><label>{t('nameEn')}</label>
                      <input className="input" value={c.name.en} onChange={e => d({ type: 'editConcept', id: c.id, patch: { name: { ...c.name, en: e.target.value } } })} /></div>
                  </div>
                </div>
                <div className="section">
                  <h4>{t('notes')}</h4>
                  <textarea className="textarea" rows={3} value={c.note} placeholder={t('notesPh')} onChange={e => d({ type: 'editConcept', id: c.id, patch: { note: e.target.value } })} />
                </div>
                <div className="section">
                  <h4>{t('palette')}</h4>
                  <div className="palette-row">
                    {c.palette.map(p => (
                      <button key={p.hex} className="pal" onClick={() => copy(p.hex)} title={`${p.name} · ${p.hex}`}>
                        <div className="pal-color" style={{ background: p.hex }} />
                        <div className="pal-text">{p.name}<span>{p.hex}</span></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="section">
                  <h4>{t('designCard')}</h4>
                  <dl className="kv">
                    <dt>{t('family')}</dt><dd>{fam[s.lang]}</dd>
                    <dt>{t('materials')}</dt><dd>{fam.materials[s.lang]}</dd>
                    <dt>{t('provider')}</dt><dd>{c.provider}</dd>
                    {c.tags.length > 0 && <><dt>Tags</dt><dd><div className="tags">{c.tags.map(x => <span key={x} className="tag">{x}</span>)}</div></dd></>}
                  </dl>
                </div>
              </div>
              <div className="drawer-foot">
                <button className="btn" onClick={() => d({ type: 'toggleLike', id: c.id })}>{c.liked ? '❤️' : '🤍'} {t('like')}</button>
                <button className={`btn ${c.shortlisted ? '' : 'brass'}`} onClick={() => d({ type: 'toggleShortlist', ids: [c.id] })}>⭐ {c.shortlisted ? t('unshortlist') : t('shortlist')}</button>
                <button className="btn" onClick={() => { if (!s.selected.includes(c.id)) d({ type: 'toggleSelect', id: c.id }); d({ type: 'chatOpen', open: true }); d({ type: 'detail', id: null }); }}>💬 {t('addToChat')}</button>
                <button className="btn" onClick={() => d({ type: 'viewsFor', id: c.id })}>🔄 {t('views')}</button>
                <button className="btn" onClick={() => d({ type: 'toast', text: `✨ ${t('exploreRelated')}` })}>✨ {t('exploreRelated')}</button>
                <a className="btn" href={c.img} download={`${c.code}-${c.name.en}.png`}>⬇️ {t('download')}</a>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
