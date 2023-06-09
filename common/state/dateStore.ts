import { create } from 'zustand';
import {
  ONE_WEEK_AGO_STRING,
  ONE_YEAR_AGO_STRING,
  OVERVIEW_OPTIONS,
  TODAY_STRING,
} from '../constants/dates';
import type { Tab } from '../constants/dashboardTabs';
import { BUS_DEFAULTS, SUBWAY_DEFAULTS, SYSTEM_DEFAULTS } from './defaults/dateDefaults';
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
  overviewPresetChange: (overviewConfig: OverviewPresetParams) => void;
}

export const useDateStore = create<DateStore>((set) => ({
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: ONE_WEEK_AGO_STRING,
    endDate: TODAY_STRING,
  },
  singleTripConfig: {
    date: TODAY_STRING,
  },
  systemConfig: {
    startDate: ONE_YEAR_AGO_STRING,
    endDate: TODAY_STRING,
  },
  overviewPreset: { view: 'year' },
  setLineConfig: (lineParams) => set(() => ({ lineConfig: lineParams })),
  setSingleTripConfig: (tripParams) => set(() => ({ singleTripConfig: tripParams })),
  setMultiTripConfig: (tripParams) => set(() => ({ multiTripConfig: tripParams })),
  swapDashboardTabs: (newTab) =>
    set(() => {
      if (newTab === 'Subway') return SUBWAY_DEFAULTS;
      if (newTab === 'Bus') return BUS_DEFAULTS;
      if (newTab === 'System') return SYSTEM_DEFAULTS;
      return {};
    }),
  overviewPresetChange: (overviewConfig) =>
    set(() => ({
      lineConfig: {
        endDate: TODAY_STRING,
        startDate: OVERVIEW_OPTIONS[overviewConfig.view].startDate,
      },
      overviewPreset: overviewConfig,
    })),
}));
