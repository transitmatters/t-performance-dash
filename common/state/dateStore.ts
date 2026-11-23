import { create } from 'zustand';
import { SUBWAY_DEFAULTS, SYSTEM_DEFAULTS } from './defaults/dateDefaults';
import type {
  LineSectionParams,
  MultiTripsSectionParams,
  SingleTripsSectionParams,
  SystemSectionParams,
} from './types/dateStoreTypes';

export type TripPage = 'singleTrips' | 'multiTrips';

export interface DateStore {
  /** The trip view (single day or date range) last left, which the sidebar's Trips item reopens. */
  tripPage: TripPage;
  setTripPage: (tripPage: TripPage) => void;
  lineConfig: LineSectionParams;
  singleTripConfig: SingleTripsSectionParams;
  multiTripConfig: MultiTripsSectionParams;
  systemConfig: SystemSectionParams;
  setLineConfig: (lineConfig: LineSectionParams) => void;
  setSingleTripConfig: (tripConfig: SingleTripsSectionParams) => void;
  setMultiTripConfig: (tripConfig: MultiTripsSectionParams) => void;
  setSystemConfig: (systemConfig: SystemSectionParams) => void;
}

// Seeded with the defaults so links into a section always carry dates, even on a cold session.
export const useDateStore = create<DateStore>((set) => ({
  tripPage: 'singleTrips',
  setTripPage: (tripPage) => set(() => ({ tripPage })),
  lineConfig: { ...SUBWAY_DEFAULTS.lineConfig },
  multiTripConfig: { ...SUBWAY_DEFAULTS.multiTripConfig },
  singleTripConfig: { ...SUBWAY_DEFAULTS.singleTripConfig },
  systemConfig: { ...SYSTEM_DEFAULTS.systemConfig },
  setLineConfig: (lineParams) => set(() => ({ lineConfig: lineParams })),
  setSingleTripConfig: (tripParams) => set(() => ({ singleTripConfig: tripParams })),
  setMultiTripConfig: (tripParams) => set(() => ({ multiTripConfig: tripParams })),
  setSystemConfig: (systemParams) => set(() => ({ systemConfig: systemParams })),
}));
