import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BetaNoticeState {
  rumNoticeDismissed: boolean;
  dismissRumNotice: () => void;
}

export const useBetaNoticeStore = create<BetaNoticeState>()(
  persist(
    (set) => ({
      rumNoticeDismissed: false,
      dismissRumNotice: () => set({ rumNoticeDismissed: true }),
    }),
    { name: 'tm-beta-rum-notice' }
  )
);
