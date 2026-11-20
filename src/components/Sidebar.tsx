import { useState } from 'react';
import { useStore, type FolderScope, type Page } from '../store';
import type { Key } from '../i18n';
import Popover from './Popover';

const DND = 'application/x-lds-ids';

function NavItem({ active, emoji, label, count, onClick, onDropIds, menu }: {
  active: boolean; emoji: string; label: string; count?: number; onClick: () => void;
  onDropIds?: (ids: string[]) => void; menu?: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  const { t } = useStore();
  return (
    <div
      className={`nav-row ${over ? 'drop-over' : ''}`}
      onDragOver={onDropIds ? e => { if (e.dataTransfer.types.includes(DND)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); } } : undefined}
      onDragLeave={onDropIds ? () => setOver(false) : undefined}
      onDrop={onDropIds ? e => { e.preventDefault(); setOver(false); try { onDropIds(JSON.parse(e.dataTransfer.getData(DND))); } catch { /* ignore */ } } : undefined}
    >
      <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} title={label}>
        <span className="emoji">{emoji}</span>
        <span className="label">{over ? t('dropHere') : label}</span>
        {count !== undefined && <span className="nav-count">{count}</span>}
      </button>
      {menu}
    </div>
  );
}

export default function Sidebar() {
  const { s, d, t } = useStore();
  const nav = (page: Page) => () => d({ type: 'page', page });
  const scopeTo = (scope: FolderScope) => () => d({ type: 'scope', scope });
  const inLibrary = s.page === 'gallery';
  const count = (scope: FolderScope) => s.concepts.filter(c => (scope === null ? true : scope === 'unfiled' ? !c.folderId : c.folderId === scope)).length;
  const pct = Math.min(100, (s.spendCny / s.capCny) * 100);
  const item = (page: Page, emoji: string, key: Key, n?: number) => (
    <NavItem active={s.page === page} emoji={emoji} label={t(key)} count={n} onClick={nav(page)} />
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">🔥</div>
        <div className="brand-text">
          <div className="brand-name">{t('appName')}</div>
          <div className="brand-sub">{s.lang === 'zh' ? 'Lighter Design Studio' : '打火机设计工作室'}</div>
        </div>
      </div>

      <div className="sidebar-scroll">
        {item('home', '🏠', 'nav_home')}

        <div className="nav-section">{s.lang === 'zh' ? '设计' : 'Design'}</div>
        {item('brief', '📝', 'nav_brief')}
        {item('research', '🔎', 'nav_research')}
        {item('generate', '✨', 'nav_generate', s.jobs.filter(j => j.status === 'running').length || undefined)}

        <div className="nav-section nav-section-row">
          <span>{t('library')}</span>
          <button className="mini-btn" title={t('newFolder')} onClick={() => d({ type: 'folderDialog', dialog: { mode: 'create' } })}>＋</button>
        </div>
        <NavItem active={inLibrary && s.scope === null} emoji="🖼️" label={t('allDesigns')} count={count(null)} onClick={scopeTo(null)} />
        <NavItem active={inLibrary && s.scope === 'unfiled'} emoji="📥" label={t('unfiled')} count={count('unfiled')} onClick={scopeTo('unfiled')}
          onDropIds={ids => d({ type: 'move', ids, folderId: null })} />
        {s.folders.map(f => (
          <NavItem key={f.id} active={inLibrary && s.scope === f.id} emoji={f.emoji} label={f.name} count={count(f.id)} onClick={scopeTo(f.id)}
            onDropIds={ids => d({ type: 'move', ids, folderId: f.id })}
            menu={
              <Popover className="nav-menu" trigger={<span className="mini-btn" title="⋯">⋯</span>}>
                {close => (
                  <>
                    <button className="menu-item" onClick={() => { close(); d({ type: 'folderDialog', dialog: { mode: 'rename', folderId: f.id } }); }}>✏️ {t('rename')}</button>
                    <button className="menu-item danger" onClick={() => { close(); d({ type: 'confirmDelete', id: f.id }); }}>🗑️ {t('deleteFolder')}</button>
                  </>
                )}
              </Popover>
            } />
        ))}
        <button className="nav-item nav-add" onClick={() => d({ type: 'folderDialog', dialog: { mode: 'create' } })}>
          <span className="emoji">➕</span><span className="label">{t('newFolder')}</span>
        </button>

        <div className="nav-section">{s.lang === 'zh' ? '挑选' : 'Review'}</div>
        {item('shortlist', '⭐', 'nav_shortlist', s.concepts.filter(c => c.shortlisted).length)}
        {item('views', '🔄', 'nav_views')}

        <div className="nav-section">{s.lang === 'zh' ? '系统' : 'System'}</div>
        {item('settings', '⚙️', 'nav_settings')}
      </div>

      <div className="sidebar-foot">
        <div className="spend-label"><span>{t('spend')}</span><span className="spend-value">¥{s.spendCny.toFixed(1)}</span></div>
        <div className="meter"><span style={{ width: `${pct}%` }} /></div>
        <div className="hint">{t('of')} ¥{s.capCny}</div>
      </div>
    </aside>
  );
}

export { DND };
