import { create } from 'zustand';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../constants/dates';
import type { Tab } from '../constants/dashboardTabs';
import { BUS_DEFAULTS, SUBWAY_DEFAULTS } from './defaults/dashboardDefaults';
import type {
  LineSectionParams,
  OverviewPresetParams,
  SystemSectionParams,
  TripsSectionParams,
} from './types/dateConfigTypes';

export interface DateConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  systemConfig: SystemSectionParams;
  overviewPreset: OverviewPresetParams;
  swapDashboardTabs: (newTab: Tab) => void;
  setLineConfig: (lineConfig: LineSectionParams) => void;
  setTripConfig: (tripConfig: TripsSectionParams) => void;
  setSystemConfig: (systemConfig: SystemSectionParams) => void;
  overviewPresetChange: (overviewConfig: OverviewPresetParams) => void;
}

export const useDateConfig = create<DateConfig>((set) => ({
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: TODAY_STRING, queryType: 'single' },
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  overviewPreset: { view: 'year' },
  setLineConfig: (lineParams) => set(() => ({ lineConfig: lineParams })),
  setTripConfig: (tripParams) => set(() => ({ tripConfig: tripParams })),
  setSystemConfig: (systemParams) => set(() => ({ systemConfig: systemParams })),
  swapDashboardTabs: (newTab) =>
    set(() => {
      if (newTab === 'Subway') return SUBWAY_DEFAULTS;
      if (newTab === 'Bus') return BUS_DEFAULTS;
      if (newTab === 'System') return BUS_DEFAULTS;
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
