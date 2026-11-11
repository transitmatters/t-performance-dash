import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommandPaletteState {
  open: boolean;
  query: string;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setQuery: (query: string) => void;
}

/** Opening starts a fresh search; closing keeps the query so the list doesn't change as it fades. */
export const useCommandPaletteStore = create<CommandPaletteState>()((set, get) => ({
  open: false,
  query: '',
  setOpen: (open) => set(open ? { open, query: '' } : { open }),
  toggle: () => get().setOpen(!get().open),
  setQuery: (query) => set({ query }),
}));

const MAX_RECENT = 5;

interface RecentCommandsState {
  ids: string[];
  add: (id: string) => void;
}

/** The last few commands run, most recent first, shown when the palette opens with no query. */
export const useRecentCommandsStore = create<RecentCommandsState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) =>
        set({ ids: [id, ...get().ids.filter((other) => other !== id)].slice(0, MAX_RECENT) }),
    }),
    { name: 'tm-command-recent' }
  )
);
