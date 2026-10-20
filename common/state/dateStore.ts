import { create } from 'zustand';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../constants/dates';
import type { Tab } from '../types/router';
import { SUBWAY_DEFAULTS, SYSTEM_DEFAULTS } from './defaults/dateDefaults';
import type {
  LineSectionParams,
  MultiTripsSectionParams,
  OverviewPresetParams,
  SingleTripsSectionParams,
  SystemSectionParams,
} from './types/dateStoreTypes';

export interface DateStore {
  lineConfig: LineSectionParams;
  singleTripConfig: SingleTripsSectionParams;
  multiTripConfig: MultiTripsSectionParams;
  systemConfig: SystemSectionParams;
  overviewPreset: OverviewPresetParams;
  swapDashboardTabs: (newTab: Tab) => void;
  setLineConfig: (lineConfig: LineSectionParams) => void;
  setSingleTripConfig: (tripConfig: SingleTripsSectionParams) => void;
  setMultiTripConfig: (tripConfig: MultiTripsSectionParams) => void;
  setSystemConfig: (systemConfig: SystemSectionParams) => void;
  overviewPresetChange: (overviewConfig: OverviewPresetParams) => void;
}

// Seeded with the defaults so links into a section always carry dates, even on a cold session.
export const useDateStore = create<DateStore>((set) => ({
  lineConfig: { ...SUBWAY_DEFAULTS.lineConfig },
  multiTripConfig: { ...SUBWAY_DEFAULTS.multiTripConfig },
  singleTripConfig: { ...SUBWAY_DEFAULTS.singleTripConfig },
  systemConfig: { ...SYSTEM_DEFAULTS.systemConfig },
  overviewPreset: {},
  setLineConfig: (lineParams) => set(() => ({ lineConfig: lineParams })),
  setSingleTripConfig: (tripParams) => set(() => ({ singleTripConfig: tripParams })),
  setMultiTripConfig: (tripParams) => set(() => ({ multiTripConfig: tripParams })),
  setSystemConfig: (systemParams) => set(() => ({ systemConfig: systemParams })),
  swapDashboardTabs: () =>
    set(() => {
      return {};
    }),
  overviewPresetChange: (overviewConfig) =>
    set(() => ({
      lineConfig: {
        endDate: TODAY_STRING,
        startDate: OVERVIEW_OPTIONS[overviewConfig.view ?? 'year'].startDate,
      },
      overviewPreset: overviewConfig,
    })),
}));
