import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** What the reader has chosen to show on charts. Remembered per browser. */
interface DisplayStore {
  /** Major event markers on date-range charts. */
  showEvents: boolean;
  /** The weather row under charts, and the shading pinned from it. */
  showWeather: boolean;
  /** The temperature row under charts, and the temperature line pinned from it. */
  showTemperature: boolean;
  /** Other lines' shuttles and suspensions, shaded in their line color. Off by default. */
  showOtherShutdowns: boolean;
  setShowEvents: (showEvents: boolean) => void;
  setShowWeather: (showWeather: boolean) => void;
  setShowTemperature: (showTemperature: boolean) => void;
  setShowOtherShutdowns: (showOtherShutdowns: boolean) => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      showEvents: true,
      showWeather: true,
      showTemperature: true,
      showOtherShutdowns: false,
      setShowEvents: (showEvents) => set({ showEvents }),
      setShowWeather: (showWeather) => set({ showWeather }),
      setShowTemperature: (showTemperature) => set({ showTemperature }),
      setShowOtherShutdowns: (showOtherShutdowns) => set({ showOtherShutdowns }),
    }),
    // A browser that blocks storage just starts with the defaults each visit.
    { name: 'display-options', storage: createJSONStorage(() => localStorage) }
  )
);

interface DisplayOption {
  key: 'events' | 'otherShutdowns' | 'weather' | 'temperature';
  label: string;
  description: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

/**
 * The display store as a list of toggles, in the order the page controls show them. Pages with
 * no major events to mark, or no subway to compare against, leave those toggles out.
 */
export const useDisplayOptions = ({
  withEvents,
  withOtherShutdowns,
}: {
  withEvents: boolean;
  withOtherShutdowns: boolean;
}): DisplayOption[] => {
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
      key: 'otherShutdowns',
      label: 'Shutdowns on other lines',
      description: 'Subway shuttles and suspensions that can shift riders onto this line',
      checked: store.showOtherShutdowns,
      setChecked: store.setShowOtherShutdowns,
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
  return options.filter(
    ({ key }) =>
      (key !== 'events' || withEvents) && (key !== 'otherShutdowns' || withOtherShutdowns)
  );
};
