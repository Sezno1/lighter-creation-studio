import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { familyById } from '../data';
import { searchText, useStore, type Page } from '../store';
import { tr as trl, type Key } from '../i18n';
import ConceptImage from './ConceptImage';

type Item =
  | { kind: 'design'; id: string; label: string; sub: string; run: () => void }
  | { kind: 'folder'; id: string; label: string; sub: string; emoji: string; run: () => void }
  | { kind: 'page'; id: string; label: string; sub: string; emoji: string; run: () => void };

const PAGES: { page: Page; emoji: string; key: Key }[] = [
  { page: 'home', emoji: '🏠', key: 'nav_home' }, { page: 'gallery', emoji: '🖼️', key: 'nav_gallery' }, { page: 'shortlist', emoji: '⭐', key: 'nav_shortlist' },
  { page: 'generate', emoji: '✨', key: 'nav_generate' }, { page: 'views', emoji: '🔄', key: 'nav_views' }, { page: 'brief', emoji: '📝', key: 'nav_brief' },
  { page: 'research', emoji: '🔎', key: 'nav_research' }, { page: 'settings', emoji: '⚙️', key: 'nav_settings' }
];

export default function CommandPalette() {
  const { s, d, t } = useStore();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => { if (s.cmdOpen) { setQ(''); setActive(0); input.current?.focus(); } }, [s.cmdOpen]);

  const items = useMemo<Item[]>(() => {
    const needle = q.trim().toLowerCase();
    const fam = (id: string) => `${familyById(id).en} ${familyById(id).zh}`;
    const designs = s.concepts
      .filter(c => !needle || searchText(c, s.folders, fam).includes(needle))
      .slice(0, needle ? 8 : 5)
      .map<Item>(c => {
        const f = s.folders.find(x => x.id === c.folderId);
        return { kind: 'design', id: c.id, label: c.name[s.lang], sub: `${c.code} · ${f ? `${f.emoji} ${f.name}` : t('unfiled')}`,
          run: () => d({ type: 'detail', id: c.id, order: s.concepts.map(x => x.id) }) };
      });
    const folders = s.folders
      .filter(f => !needle || f.name.toLowerCase().includes(needle))
      .map<Item>(f => ({ kind: 'folder', id: f.id, emoji: f.emoji, label: f.name, sub: `${s.concepts.filter(c => c.folderId === f.id).length} ${t('designsCount')}`, run: () => d({ type: 'scope', scope: f.id }) }));
    const pages = PAGES
      .filter(p => !needle || `${trl('zh', p.key)} ${trl('en', p.key)}`.toLowerCase().includes(needle))
      .map<Item>(p => ({ kind: 'page', id: p.page, emoji: p.emoji, label: t(p.key), sub: '', run: () => (p.page === 'gallery' ? d({ type: 'scope', scope: null }) : d({ type: 'page', page: p.page })) }));
    return [...designs, ...folders, ...pages];
  }, [q, s.concepts, s.folders, s.lang, d, t]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => { list.current?.querySelector('.cmd-item.active')?.scrollIntoView({ block: 'nearest' }); }, [active]);

  if (!s.cmdOpen) return null;
  const close = () => d({ type: 'cmd', open: false });
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[active]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  const group = (kind: Item['kind'], label: Key) => {
    const g = items.map((it, i) => ({ it, i })).filter(x => x.it.kind === kind);
    if (!g.length) return null;
    return (
      <div className="cmd-group">
        <div className="cmd-label">{t(label)}</div>
        {g.map(({ it, i }) => (
          <button key={`${it.kind}-${it.id}`} className={`cmd-item ${i === active ? 'active' : ''}`} onMouseMove={() => setActive(i)} onClick={it.run}>
            <span className="cmd-icon">
              {it.kind === 'design' ? <span className="cmd-thumb"><ConceptImage c={s.concepts.find(c => c.id === it.id)!} /></span> : it.emoji}
            </span>
            <span className="cmd-text"><b>{it.label}</b>{it.sub && <span>{it.sub}</span>}</span>
            <span className="cmd-enter">↵</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-wrap cmd-wrap" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="cmd card" role="dialog" aria-modal="true" onKeyDown={onKey}>
        <div className="cmd-input">
          <span>🔍</span>
          <input ref={input} autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t('cmdPh')} />
          <kbd>Esc</kbd>
        </div>
        <div className="cmd-list" ref={list}>
          {items.length === 0 ? <div className="cmd-none">🤷 {t('cmdNone')}</div> : <>{group('design', 'cmdDesigns')}{group('folder', 'cmdFolders')}{group('page', 'cmdPages')}</>}
        </div>
        <div className="cmd-foot">{t('cmdHint')}</div>
      </div>
    </div>
  );
}
