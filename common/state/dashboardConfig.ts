import { create } from 'zustand';
import type { OverviewDatePresetKey } from '../constants/dates';
import { BUS_MAX_DATE, OVERVIEW_OPTIONS, TODAY_STRING } from '../constants/dates';
import type { Tab } from '../constants/dashboardTabs';
import type { QueryTypeOptions } from '../types/router';

type LineSectionParams = {
  startDate?: string;
  endDate?: string;
};

// TODO: Review optionality of props. Maybe use Partial?
type TripsSectionParams = {
  startDate?: string;
  endDate?: string;
  queryType?: QueryTypeOptions;
  from?: string;
  to?: string;
};

type OverviewPresetParams = {
  view: OverviewDatePresetKey;
};

interface FullConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  overviewPreset?: OverviewPresetParams;
}

export interface DashboardConfig {
  lineConfig: LineSectionParams;
  tripConfig: TripsSectionParams;
  overviewPreset: OverviewPresetParams;
  swapDashboardTabs: (newTab: Tab) => void;
  setLineConfig: (lineConfig: LineSectionParams) => void;
  setTripConfig: (tripConfig: TripsSectionParams) => void;
  overviewPresetChange: (overviewConfig: OverviewPresetParams) => void;
}

export const SUBWAY_DEFAULTS: FullConfig = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: TODAY_STRING, queryType: 'single' },
  overviewPreset: { view: 'year' },
};

export const BUS_DEFAULTS: FullConfig = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: BUS_MAX_DATE, queryType: 'single' },
  overviewPreset: undefined,
};

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
