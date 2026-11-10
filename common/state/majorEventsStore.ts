import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MajorEventsStore {
  /** Whether date-range charts mark major events. On by default; remembered per browser. */
  showEvents: boolean;
  setShowEvents: (showEvents: boolean) => void;
}

export const useMajorEventsStore = create<MajorEventsStore>()(
  persist(
    (set) => ({
      showEvents: true,
      setShowEvents: (showEvents) => set({ showEvents }),
    }),
    // A browser that blocks storage just starts with events shown each visit.
    { name: 'major-events', storage: createJSONStorage(() => localStorage) }
  )
);
