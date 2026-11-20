import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { buildConcepts, type Concept, type Folder, type ViewKey } from './data';
import { tr, type Key, type Lang } from './i18n';

export type Page = 'home' | 'brief' | 'research' | 'generate' | 'gallery' | 'shortlist' | 'views' | 'settings';
/** null = all designs, 'unfiled' = no folder, otherwise a folder id */
export type FolderScope = null | 'unfiled' | string;
export interface ChatMsg { id: number; role: 'user' | 'assistant'; text: string; refs: string[] }
export interface Job { id: string; total: number; done: number; status: 'running' | 'done' | 'cancelled'; model: string; startedAt: number; costCny: number }
export interface Toast { id: number; text: string; undo?: Snapshot }
interface Snapshot { concepts: Concept[]; folders: Folder[]; scope: FolderScope }
export type SortKey = 'newest' | 'oldest' | 'name' | 'family';

interface State {
  lang: Lang;
  page: Page;
  scope: FolderScope;
  concepts: Concept[];
  folders: Folder[];
  selected: string[];
  chatOpen: boolean;
  chat: ChatMsg[];
  detailId: string | null;
  detailOrder: string[]; // the list the drawer steps through with ← →
  viewsFor: string | null;
  jobs: Job[];
  spendCny: number;
  capCny: number;
  roles: Record<'draft' | 'final' | 'views' | 'brain', string>;
  toast: Toast | null;
  cmdOpen: boolean;
  layout: 'grid' | 'list';
  cardSize: 's' | 'm' | 'l';
  sort: SortKey;
  folderDialog: null | { mode: 'create' | 'rename'; folderId?: string; moveIds?: string[] };
  confirmDelete: string | null;
}

type Action =
  | { type: 'lang'; lang: Lang }
  | { type: 'page'; page: Page }
  | { type: 'scope'; scope: FolderScope }
  | { type: 'toggleSelect'; id: string }
  | { type: 'selectMany'; ids: string[] }
  | { type: 'clearSelect' }
  | { type: 'toggleLike'; id: string }
  | { type: 'toggleShortlist'; ids: string[]; value?: boolean }
  | { type: 'chatOpen'; open: boolean }
  | { type: 'chatSend'; text: string }
  | { type: 'chatReply'; text: string; refs: string[] }
  | { type: 'detail'; id: string | null; order?: string[] }
  | { type: 'detailStep'; dir: 1 | -1 }
  | { type: 'viewsFor'; id: string | null }
  | { type: 'setView'; id: string; view: ViewKey; state: Concept['views'][ViewKey] }
  | { type: 'jobStart'; job: Job }
  | { type: 'jobTick'; id: string }
  | { type: 'jobCancel'; id: string }
  | { type: 'role'; role: keyof State['roles']; provider: string }
  | { type: 'cap'; cap: number }
  | { type: 'toast'; text: string; undo?: boolean }
  | { type: 'toastClear' }
  | { type: 'undo' }
  | { type: 'cmd'; open: boolean }
  | { type: 'layout'; layout: State['layout'] }
  | { type: 'cardSize'; size: State['cardSize'] }
  | { type: 'sort'; sort: SortKey }
  | { type: 'folderDialog'; dialog: State['folderDialog'] }
  | { type: 'folderCreate'; name: string; emoji: string; moveIds?: string[] }
  | { type: 'folderRename'; id: string; name: string; emoji: string }
  | { type: 'confirmDelete'; id: string | null }
  | { type: 'folderDelete'; id: string }
  | { type: 'move'; ids: string[]; folderId: string | null }
  | { type: 'editConcept'; id: string; patch: Partial<Pick<Concept, 'name' | 'note'>> };

let seq = 1;
const STORE_KEY = 'lighter-creation-studio.demo.v1';
type Saved = {
  lang?: Lang; chatOpen?: boolean; layout?: State['layout']; cardSize?: State['cardSize']; sort?: SortKey;
  folders?: Folder[];
  concepts?: Record<string, Partial<Pick<Concept, 'folderId' | 'note' | 'name' | 'liked' | 'shortlisted'>>>;
};
const load = (): Saved => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') as Saved; } catch { return {}; } };

const initial = (): State => {
  const saved = load();
  const folders = saved.folders ?? [];
  const concepts = buildConcepts().map(c => {
    const u = saved.concepts?.[c.id];
    if (!u) return c;
    const folderId = u.folderId && folders.some(f => f.id === u.folderId) ? u.folderId : null;
    return { ...c, ...u, folderId };
  });
  return {
    lang: saved.lang ?? 'zh', page: 'home', scope: null, concepts, folders, selected: [],
    chatOpen: saved.chatOpen ?? false, chat: [], detailId: null, detailOrder: [], viewsFor: null, jobs: [],
    spendCny: 0, capCny: 500, roles: { draft: 'seedream', final: 'gptimage', views: 'seedream', brain: 'gpt' },
    toast: null, cmdOpen: false, layout: saved.layout ?? 'grid', cardSize: saved.cardSize ?? 'm', sort: saved.sort ?? 'newest',
    folderDialog: null, confirmDelete: null
  };
};

const snap = (s: State): Snapshot => ({ concepts: s.concepts, folders: s.folders, scope: s.scope });

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lang': return { ...s, lang: a.lang };
    case 'page': return { ...s, page: a.page, detailId: null, cmdOpen: false };
    case 'scope': return { ...s, scope: a.scope, page: 'gallery', detailId: null, cmdOpen: false, selected: [] };
    case 'toggleSelect': return { ...s, selected: s.selected.includes(a.id) ? s.selected.filter(x => x !== a.id) : [...s.selected, a.id] };
    case 'selectMany': return { ...s, selected: a.ids };
    case 'clearSelect': return { ...s, selected: [] };
    case 'toggleLike': return { ...s, concepts: s.concepts.map(c => (c.id === a.id ? { ...c, liked: !c.liked } : c)) };
    case 'toggleShortlist': {
      const all = a.ids.every(id => s.concepts.find(c => c.id === id)?.shortlisted);
      const value = a.value ?? !all;
      return { ...s, concepts: s.concepts.map(c => (a.ids.includes(c.id) ? { ...c, shortlisted: value } : c)) };
    }
    case 'chatOpen': return { ...s, chatOpen: a.open };
    case 'chatSend': return { ...s, chatOpen: true, chat: [...s.chat, { id: seq++, role: 'user', text: a.text, refs: s.selected }] };
    case 'chatReply': return { ...s, chat: [...s.chat, { id: seq++, role: 'assistant', text: a.text, refs: a.refs }] };
    case 'detail': return { ...s, detailId: a.id, detailOrder: a.order ?? (a.id ? s.detailOrder : []), cmdOpen: false };
    case 'detailStep': {
      const order = s.detailOrder.length ? s.detailOrder : s.concepts.map(c => c.id);
      const i = order.indexOf(s.detailId ?? '');
      if (i < 0) return s;
      return { ...s, detailId: order[(i + a.dir + order.length) % order.length] };
    }
    case 'viewsFor': return { ...s, viewsFor: a.id, page: 'views', detailId: null };
    case 'setView': return { ...s, concepts: s.concepts.map(c => (c.id === a.id ? { ...c, views: { ...c.views, [a.view]: a.state } } : c)) };
    case 'jobStart': return { ...s, jobs: [a.job, ...s.jobs] };
    case 'jobTick': {
      let spend = s.spendCny;
      const jobs = s.jobs.map(j => {
        if (j.id !== a.id || j.status !== 'running') return j;
        const done = j.done + 1;
        spend += j.costCny / j.total;
        return { ...j, done, status: done >= j.total ? ('done' as const) : j.status };
      });
      return { ...s, jobs, spendCny: spend };
    }
    case 'jobCancel': return { ...s, jobs: s.jobs.map(j => (j.id === a.id ? { ...j, status: 'cancelled' } : j)) };
    case 'role': return { ...s, roles: { ...s.roles, [a.role]: a.provider } };
    case 'cap': return { ...s, capCny: a.cap };
    case 'toast': return { ...s, toast: { id: seq++, text: a.text } };
    case 'toastClear': return { ...s, toast: null };
    case 'undo': return s.toast?.undo ? { ...s, ...s.toast.undo, toast: null, selected: [] } : s;
    case 'cmd': return { ...s, cmdOpen: a.open };
    case 'layout': return { ...s, layout: a.layout };
    case 'cardSize': return { ...s, cardSize: a.size };
    case 'sort': return { ...s, sort: a.sort };
    case 'folderDialog': return { ...s, folderDialog: a.dialog };
    case 'folderCreate': {
      const f: Folder = { id: `f${Date.now().toString(36)}${seq++}`, name: a.name.trim(), emoji: a.emoji, createdAt: Date.now() };
      const concepts = a.moveIds?.length ? s.concepts.map(c => (a.moveIds!.includes(c.id) ? { ...c, folderId: f.id } : c)) : s.concepts;
      return { ...s, folders: [...s.folders, f], concepts, folderDialog: null, selected: a.moveIds?.length ? [] : s.selected,
        toast: { id: seq++, text: `${f.emoji} ${f.name}`, undo: snap(s) } };
    }
    case 'folderRename': return { ...s, folders: s.folders.map(f => (f.id === a.id ? { ...f, name: a.name.trim(), emoji: a.emoji } : f)), folderDialog: null };
    case 'confirmDelete': return { ...s, confirmDelete: a.id };
    case 'folderDelete': {
      const f = s.folders.find(x => x.id === a.id);
      return { ...s, folders: s.folders.filter(x => x.id !== a.id), concepts: s.concepts.map(c => (c.folderId === a.id ? { ...c, folderId: null } : c)),
        scope: s.scope === a.id ? null : s.scope, confirmDelete: null, toast: { id: seq++, text: `🗑️ ${f?.name ?? ''}`, undo: snap(s) } };
    }
    case 'move': {
      const f = s.folders.find(x => x.id === a.folderId);
      const label = f ? `${f.emoji} ${f.name}` : tr(s.lang, 'unfiled');
      return { ...s, concepts: s.concepts.map(c => (a.ids.includes(c.id) ? { ...c, folderId: a.folderId } : c)), selected: [],
        toast: { id: seq++, text: `${tr(s.lang, 'movedTo')} ${label} · ${a.ids.length}`, undo: snap(s) } };
    }
    case 'editConcept': return { ...s, concepts: s.concepts.map(c => (c.id === a.id ? { ...c, ...a.patch } : c)) };
  }
}

const Ctx = createContext<{ s: State; d: React.Dispatch<Action>; t: (k: Key) => string } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, initial);

  // Persist the owner's organization (folders, names, notes, likes) and view preferences.
  useEffect(() => {
    const concepts: Saved['concepts'] = {};
    for (const c of s.concepts) concepts[c.id] = { folderId: c.folderId, note: c.note, name: c.name, liked: c.liked, shortlisted: c.shortlisted };
    const data: Saved = { lang: s.lang, chatOpen: s.chatOpen, layout: s.layout, cardSize: s.cardSize, sort: s.sort, folders: s.folders, concepts };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* storage unavailable: still works, just not remembered */ }
  }, [s.lang, s.chatOpen, s.layout, s.cardSize, s.sort, s.folders, s.concepts]);

  useEffect(() => { document.documentElement.lang = s.lang === 'zh' ? 'zh-CN' : 'en'; }, [s.lang]);
  useEffect(() => {
    if (!s.toast) return;
    const id = setTimeout(() => d({ type: 'toastClear' }), s.toast.undo ? 5000 : 2200);
    return () => clearTimeout(id);
  }, [s.toast]);

  // Global shortcuts: ⌘K or / opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.closest('input, textarea, select, [contenteditable]') !== null);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); d({ type: 'cmd', open: true }); }
      else if (e.key === '/' && !typing) { e.preventDefault(); d({ type: 'cmd', open: true }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ s, d, t: (k: Key) => tr(s.lang, k) }), [s]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
};

/** Text used for searching a design: names, code, tags, family, folder, note. */
export function searchText(c: Concept, folders: Folder[], familyName: (id: string) => string) {
  const f = folders.find(x => x.id === c.folderId);
  return [c.name.en, c.name.zh, c.code, c.id, ...c.tags, familyName(c.familyId), f?.name ?? '', c.note, c.provider].join(' ').toLowerCase();
}

export function sortConcepts(list: Concept[], sort: SortKey, lang: Lang) {
  const by = [...list];
  if (sort === 'newest') by.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === 'oldest') by.sort((a, b) => a.createdAt - b.createdAt);
  if (sort === 'name') by.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang === 'zh' ? 'zh-CN' : 'en'));
  if (sort === 'family') by.sort((a, b) => a.familyId.localeCompare(b.familyId) || b.createdAt - a.createdAt);
  return by;
}
