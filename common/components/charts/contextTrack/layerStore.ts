import { create } from 'zustand';

interface LayerStore {
  // Context track segments shaded onto the charts, by segment key
  pinned: Record<string, true>;
  temperature: boolean;
  slowZones: boolean;
  toggle: (key: string) => void;
  toggleTemperature: () => void;
  toggleSlowZones: () => void;
}

/** Shared by every chart on the page, so pinning on one chart pins on all of them. */
export const useLayerStore = create<LayerStore>((set) => ({
  pinned: {},
  temperature: false,
  slowZones: false,
  toggle: (key) =>
    set(({ pinned }) => {
      const next = { ...pinned };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { pinned: next };
    }),
  toggleTemperature: () => set(({ temperature }) => ({ temperature: !temperature })),
  toggleSlowZones: () => set(({ slowZones }) => ({ slowZones: !slowZones })),
}));
