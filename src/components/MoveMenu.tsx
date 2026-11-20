import { useStore } from '../store';
import Popover from './Popover';

/** "Move to folder" menu for one or more designs. */
export default function MoveMenu({ ids, trigger, align = 'right', className = '' }: { ids: string[]; trigger: React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  const { s, d, t } = useStore();
  const current = ids.length === 1 ? s.concepts.find(c => c.id === ids[0])?.folderId ?? null : undefined;
  return (
    <Popover trigger={trigger} align={align} className={className}>
      {close => (
        <>
          <div className="menu-label">{t('moveTo')}</div>
          <button className={`menu-item ${current === null ? 'current' : ''}`} onClick={() => { close(); d({ type: 'move', ids, folderId: null }); }}>📥 {t('unfiled')}</button>
          {s.folders.map(f => (
            <button key={f.id} className={`menu-item ${current === f.id ? 'current' : ''}`} onClick={() => { close(); d({ type: 'move', ids, folderId: f.id }); }}>
              {f.emoji} {f.name}
            </button>
          ))}
          <div className="menu-sep" />
          <button className="menu-item" onClick={() => { close(); d({ type: 'folderDialog', dialog: { mode: 'create', moveIds: ids } }); }}>➕ {t('newFolder')}…</button>
        </>
      )}
    </Popover>
  );
}
