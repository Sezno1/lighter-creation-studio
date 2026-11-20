import { useStore } from '../store';
import type { Key } from '../i18n';

export default function Topbar() {
  const { s, d, t } = useStore();
  const folder = s.folders.find(f => f.id === s.scope);
  const where = s.page === 'gallery'
    ? (s.scope === null ? t('allDesigns') : s.scope === 'unfiled' ? t('unfiled') : `${folder?.emoji ?? ''} ${folder?.name ?? ''}`)
    : t(`nav_${s.page}` as Key);
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className="topbar">
      <div className="crumb">
        <button className="crumb-link" onClick={() => d({ type: 'page', page: 'home' })}>🏠</button>
        <span>/</span>
        {s.page === 'gallery' && <><button className="crumb-link" onClick={() => d({ type: 'scope', scope: null })}>{t('library')}</button><span>/</span></>}
        <b>{where}</b>
      </div>
      <span className="spacer" />
      <button className="search-trigger" onClick={() => d({ type: 'cmd', open: true })}>
        <span>🔍</span><span className="search-trigger-text">{t('searchAll')}</span><kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <div className="seg" role="group" aria-label={t('language')}>
        <button className={s.lang === 'zh' ? 'on' : ''} onClick={() => d({ type: 'lang', lang: 'zh' })}>中文</button>
        <button className={s.lang === 'en' ? 'on' : ''} onClick={() => d({ type: 'lang', lang: 'en' })}>EN</button>
      </div>
      <button className={`btn sm ${s.chatOpen ? '' : 'primary'}`} onClick={() => d({ type: 'chatOpen', open: !s.chatOpen })}>
        💬 <span className="hide-sm">{t('chat')}</span>{s.selected.length > 0 && <span className="pill">{s.selected.length}</span>}
      </button>
    </header>
  );
}
