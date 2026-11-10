import { create } from 'zustand';

export interface StationStore {
  from?: string;
  to?: string;
  /** The line and route the stops belong to, from `stationScope`. */
  scope?: string;
  setStationStore: (lineConfig: { from?: string; to?: string; scope?: string }) => void;
}

export const useStationStore = create<StationStore>((set) => ({
  from: undefined,
  to: undefined,
  scope: undefined,
  setStationStore: (stationParams) =>
    set(() => ({ from: stationParams.from, to: stationParams.to, scope: stationParams.scope })),
}));
