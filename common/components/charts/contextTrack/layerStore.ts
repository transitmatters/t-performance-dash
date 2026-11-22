import { create } from 'zustand';

interface LayerStore {
  // Context track segments shaded onto the charts, by segment key
  pinned: Record<string, true>;
  // Whether the temperature and slow zone rows are pinned onto the plot. Whether those rows show
  // at all is the reader's display setting (displayStore.showTemperature/showSlowZones).
  temperaturePinned: boolean;
  slowZonesPinned: boolean;
  toggle: (key: string) => void;
  toggleTemperature: () => void;
  toggleSlowZones: () => void;
}

/** Shared by every chart on the page, so pinning on one chart pins on all of them. */
export const useLayerStore = create<LayerStore>((set) => ({
  pinned: {},
  temperaturePinned: false,
  slowZonesPinned: false,
  toggle: (key) =>
    set(({ pinned }) => {
      const next = { ...pinned };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { pinned: next };
    }),
  toggleTemperature: () =>
    set(({ temperaturePinned }) => ({ temperaturePinned: !temperaturePinned })),
  toggleSlowZones: () => set(({ slowZonesPinned }) => ({ slowZonesPinned: !slowZonesPinned })),
}));
