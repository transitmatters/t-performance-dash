import { create } from 'zustand';

interface WeatherStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  enabled: true,
  setEnabled: (enabled) => set({ enabled }),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
}));
