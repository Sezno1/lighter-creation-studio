import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ChatPanel from './components/ChatPanel';
import DetailDrawer from './components/DetailDrawer';
import CommandPalette from './components/CommandPalette';
import { ConfirmDeleteFolder, FolderDialog } from './components/Dialogs';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Generate from './pages/Generate';
import Brief from './pages/Brief';
import Research from './pages/Research';
import Shortlist from './pages/Shortlist';
import Views from './pages/Views';
import Settings from './pages/Settings';

const PAGES = { home: Home, gallery: Gallery, generate: Generate, brief: Brief, research: Research, shortlist: Shortlist, views: Views, settings: Settings };

export default function App() {
  const { s, d, t } = useStore();
  const Page = PAGES[s.page];
  return (
    <div className={`shell ${s.chatOpen ? 'chat-open' : ''}`}>
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content"><Page key={`${s.page}-${s.scope ?? 'all'}`} /></div>
      </main>
      <ChatPanel />
      <DetailDrawer />
      <CommandPalette />
      <FolderDialog />
      <ConfirmDeleteFolder />
      <div className={`toast ${s.toast ? 'show' : ''}`} role="status">
        <span>{s.toast?.text}</span>
        {s.toast?.undo && <button className="toast-undo" onClick={() => d({ type: 'undo' })}>↩ {t('undo')}</button>}
      </div>
    </div>
  );
}
