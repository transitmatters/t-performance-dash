import { create } from 'zustand';

interface WeatherStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  temperatureEnabled: boolean;
  setTemperatureEnabled: (enabled: boolean) => void;
  toggleTemperature: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  temperatureEnabled: false,
  setTemperatureEnabled: (temperatureEnabled) => set({ temperatureEnabled }),
  toggleTemperature: () => set((state) => ({ temperatureEnabled: !state.temperatureEnabled })),
}));
