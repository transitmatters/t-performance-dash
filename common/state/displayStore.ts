import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** What the reader has chosen to show on charts. All on by default; remembered per browser. */
interface DisplayStore {
  /** Major event markers on date-range charts. */
  showEvents: boolean;
  /** The weather row under charts, and the shading pinned from it. */
  showWeather: boolean;
  /** The temperature row under charts, and the temperature line pinned from it. */
  showTemperature: boolean;
  setShowEvents: (showEvents: boolean) => void;
  setShowWeather: (showWeather: boolean) => void;
  setShowTemperature: (showTemperature: boolean) => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      showEvents: true,
      showWeather: true,
      showTemperature: true,
      setShowEvents: (showEvents) => set({ showEvents }),
      setShowWeather: (showWeather) => set({ showWeather }),
      setShowTemperature: (showTemperature) => set({ showTemperature }),
    }),
    // A browser that blocks storage just starts with everything shown each visit.
    { name: 'display-options', storage: createJSONStorage(() => localStorage) }
  )
);

interface DisplayOption {
  key: 'events' | 'weather' | 'temperature';
  label: string;
  description: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

/**
 * The display store as a list of toggles, in the order the page controls show them. Pages with
 * no major events to mark leave that toggle out.
 */
export const useDisplayOptions = (withEvents: boolean): DisplayOption[] => {
  const store = useDisplayStore();
  const options: DisplayOption[] = [
    {
      key: 'events',
      label: 'Major events',
      description: 'Shutdowns, diversions and other big service changes',
      checked: store.showEvents,
      setChecked: store.setShowEvents,
    },
    {
      key: 'weather',
      label: 'Weather',
      description: 'Rain, snow, fog and storms',
      checked: store.showWeather,
      setChecked: store.setShowWeather,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      description: 'Outdoor temperature in Boston',
      checked: store.showTemperature,
      setChecked: store.setShowTemperature,
    },
  ];
  return withEvents ? options : options.filter(({ key }) => key !== 'events');
};
