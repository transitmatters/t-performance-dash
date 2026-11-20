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
  /** The time slow zones added to a trip, under its travel time and speed charts. Off by default. */
  showSlowZones: boolean;
  setShowEvents: (showEvents: boolean) => void;
  setShowWeather: (showWeather: boolean) => void;
  setShowTemperature: (showTemperature: boolean) => void;
  setShowOtherShutdowns: (showOtherShutdowns: boolean) => void;
  setShowSlowZones: (showSlowZones: boolean) => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      showEvents: true,
      showWeather: true,
      showTemperature: true,
      showOtherShutdowns: false,
      showSlowZones: false,
      setShowEvents: (showEvents) => set({ showEvents }),
      setShowWeather: (showWeather) => set({ showWeather }),
      setShowTemperature: (showTemperature) => set({ showTemperature }),
      setShowOtherShutdowns: (showOtherShutdowns) => set({ showOtherShutdowns }),
      setShowSlowZones: (showSlowZones) => set({ showSlowZones }),
    }),
    // A browser that blocks storage just starts with the defaults each visit.
    { name: 'display-options', storage: createJSONStorage(() => localStorage) }
  )
);

interface DisplayOption {
  key: 'events' | 'otherShutdowns' | 'slowZones' | 'weather' | 'temperature';
  label: string;
  description: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

/**
 * The display store as a list of toggles, in the order the page controls show them. Pages with
 * no major events to mark, no subway to compare against, or no slow zone trip leave those out.
 */
export const useDisplayOptions = ({
  withEvents,
  withOtherShutdowns,
  withSlowZones,
}: {
  withEvents: boolean;
  withOtherShutdowns: boolean;
  withSlowZones: boolean;
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
      key: 'slowZones',
      label: 'Slow zones',
      description: 'Time slow zones added to this trip',
      checked: store.showSlowZones,
      setChecked: store.setShowSlowZones,
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
      (key !== 'events' || withEvents) &&
      (key !== 'otherShutdowns' || withOtherShutdowns) &&
      (key !== 'slowZones' || withSlowZones)
  );
};
