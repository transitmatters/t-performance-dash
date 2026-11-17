import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MajorEventsStore {
  /** Whether date-range charts mark major events. On by default; remembered per browser. */
  showEvents: boolean;
  setShowEvents: (showEvents: boolean) => void;
  /** Whether a line's charts shade shutdowns on the rest of the subway. Off by default. */
  showOtherShutdowns: boolean;
  setShowOtherShutdowns: (showOtherShutdowns: boolean) => void;
}

export const useMajorEventsStore = create<MajorEventsStore>()(
  persist(
    (set) => ({
      showEvents: true,
      setShowEvents: (showEvents) => set({ showEvents }),
      showOtherShutdowns: false,
      setShowOtherShutdowns: (showOtherShutdowns) => set({ showOtherShutdowns }),
    }),
    // A browser that blocks storage just starts with events shown each visit.
    { name: 'major-events', storage: createJSONStorage(() => localStorage) }
  )
);
