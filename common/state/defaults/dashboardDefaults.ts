import { BUS_MAX_DATE, OVERVIEW_OPTIONS, TODAY_STRING } from '../../constants/dates';
import type { FullDashboardConfig } from '../types/dashboardConfigTypes';

export const SUBWAY_DEFAULTS: FullDashboardConfig = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: TODAY_STRING, queryType: 'single' },
  overviewPreset: { view: 'year' },
};

export const BUS_DEFAULTS: FullDashboardConfig = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: BUS_MAX_DATE, queryType: 'single' },
  overviewPreset: undefined,
};
