import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BetaNoticeState {
  rumNoticeDismissed: boolean;
  feedbackNoticeDismissed: boolean;
  dismissRumNotice: () => void;
  dismissFeedbackNotice: () => void;
}

export const useBetaNoticeStore = create<BetaNoticeState>()(
  persist(
    (set) => ({
      rumNoticeDismissed: false,
      feedbackNoticeDismissed: false,
      dismissRumNotice: () => set({ rumNoticeDismissed: true }),
      dismissFeedbackNotice: () => set({ feedbackNoticeDismissed: true }),
    }),
    { name: 'tm-beta-rum-notice' }
  )
);
