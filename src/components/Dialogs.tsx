import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

const EMOJIS = ['📁', '⭐', '🔥', '💎', '🎁', '🏷️', '🧪', '✅', '🕰️', '🌿', '⚙️', '🧳'];

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-wrap" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal card" role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

export function FolderDialog() {
  const { s, d, t } = useStore();
  const dlg = s.folderDialog;
  const editing = dlg?.mode === 'rename' ? s.folders.find(f => f.id === dlg.folderId) : undefined;
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dlg) return;
    setName(editing?.name ?? '');
    setEmoji(editing?.emoji ?? '📁');
    setTimeout(() => input.current?.select(), 30);
  }, [dlg, editing]);

  if (!dlg) return null;
  const close = () => d({ type: 'folderDialog', dialog: null });
  const ok = name.trim().length > 0;
  const submit = () => {
    if (!ok) return;
    if (editing) d({ type: 'folderRename', id: editing.id, name, emoji });
    else d({ type: 'folderCreate', name, emoji, moveIds: dlg.moveIds });
  };

  return (
    <Modal onClose={close}>
      <form onSubmit={e => { e.preventDefault(); submit(); }}>
        <h3 className="modal-title">{editing ? `✏️ ${t('rename')}` : `📁 ${t('newFolder')}`}</h3>
        <div className="field">
          <label>{t('folderName')}</label>
          <input ref={input} className="input" value={name} maxLength={40} onChange={e => setName(e.target.value)}
            placeholder={s.lang === 'zh' ? '例如:2026春季、客户A、黄铜系列' : 'e.g. Spring 2026, Client A, Brass range'} />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label>{t('folderIcon')}</label>
          <div className="emoji-grid">
            {EMOJIS.map(e => <button type="button" key={e} className={`emoji-pick ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>)}
          </div>
        </div>
        {dlg.moveIds?.length ? <p className="hint" style={{ margin: '16px 0 0' }}>{t('moveTo')}: {dlg.moveIds.length} {t('selected')}</p> : null}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={close}>{t('cancel')}</button>
          <button className="btn primary" disabled={!ok}>{editing ? t('save') : t('create')}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmDeleteFolder() {
  const { s, d, t } = useStore();
  const f = s.folders.find(x => x.id === s.confirmDelete);
  if (!f) return null;
  const n = s.concepts.filter(c => c.folderId === f.id).length;
  const close = () => d({ type: 'confirmDelete', id: null });
  return (
    <Modal onClose={close}>
      <h3 className="modal-title">🗑️ {t('deleteFolder')}: {f.emoji} {f.name}</h3>
      <p style={{ margin: 0, color: 'var(--ink-2)' }}>{t('deleteFolderQ')}{n ? ` (${n})` : ''}</p>
      <div className="modal-actions">
        <button className="btn" onClick={close}>{t('cancel')}</button>
        <button className="btn danger" autoFocus onClick={() => d({ type: 'folderDelete', id: f.id })}>{t('delete')}</button>
      </div>
    </Modal>
  );
}
