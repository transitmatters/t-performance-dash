import { create } from 'zustand';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../constants/dates';
import type { Tab } from '../constants/dashboardTabs';
import { BUS_DEFAULTS, SUBWAY_DEFAULTS } from './dashboardDefaults';
import type {
  LineSectionParams,
  OverviewPresetParams,
  TripsSectionParams,
} from './types/dashboardConfigTypes';

export interface DashboardConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  overviewPreset: OverviewPresetParams;
  swapDashboardTabs: (newTab: Tab) => void;
  setLineConfig: (lineConfig: LineSectionParams) => void;
  setTripConfig: (tripConfig: TripsSectionParams) => void;
  overviewPresetChange: (overviewConfig: OverviewPresetParams) => void;
}

export const useDashboardConfig = create<DashboardConfig>((set) => ({
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: TODAY_STRING, queryType: 'single' },
  overviewPreset: { view: 'year' },
  setLineConfig: (lineParams) => set(() => ({ lineConfig: lineParams })),
  setTripConfig: (tripParams) => set(() => ({ tripConfig: tripParams })),
  swapDashboardTabs: (newTab) =>
    set(() => {
      if (newTab === 'Subway') {
        return SUBWAY_DEFAULTS;
      }
      if (newTab === 'Bus') {
        return BUS_DEFAULTS;
      }
      return SUBWAY_DEFAULTS;
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
