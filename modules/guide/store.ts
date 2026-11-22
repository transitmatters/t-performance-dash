import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuideNodeId } from './tree';

interface GuideState {
  open: boolean;
  node: GuideNodeId;
  /** Nodes visited before this one, for Back. Cleared when the guide opens. */
  history: GuideNodeId[];
  /** The first-visit hello has been answered, so it doesn't come back. Persisted. */
  greeted: boolean;
  /** Put away for good from its corner; search's "Show the guide" brings it back. Persisted. */
  hidden: boolean;
  openAt: (node: GuideNodeId) => void;
  goTo: (node: GuideNodeId) => void;
  back: () => void;
  close: () => void;
  hide: () => void;
  markGreeted: () => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      open: false,
      node: 'welcome',
      history: [],
      greeted: false,
      hidden: false,
      openAt: (node) => set({ open: true, node, history: [], greeted: true, hidden: false }),
      goTo: (node) => set({ node, history: [...get().history, get().node] }),
      back: () => {
        const { history } = get();
        if (!history.length) return;
        set({ node: history[history.length - 1], history: history.slice(0, -1) });
      },
      close: () => set({ open: false }),
      hide: () => set({ open: false, hidden: true, greeted: true }),
      markGreeted: () => set({ greeted: true }),
    }),
    { name: 'tm-guide', partialize: ({ greeted, hidden }) => ({ greeted, hidden }) }
  )
);
