import { create } from 'zustand';

export interface StationConfig {
  from?: string;
  to?: string;
  setStationConfig: (lineConfig: { from?: string; to?: string }) => void;
}

export const useStationConfig = create<StationConfig>((set) => ({
  from: undefined,
  to: undefined,
  setStationConfig: (stationParams) =>
    set(() => ({ from: stationParams.from, to: stationParams.to })),
}));
