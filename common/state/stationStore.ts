import { create } from 'zustand';

export interface StationStore {
  from?: string;
  to?: string;
  setStationStore: (lineConfig: { from?: string; to?: string }) => void;
}

export const useStationStore = create<StationStore>((set) => ({
  from: undefined,
  to: undefined,
  setStationStore: (stationParams) =>
    set(() => ({ from: stationParams.from, to: stationParams.to })),
}));
