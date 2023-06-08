import {
  BUS_MAX_DATE,
  BUS_MAX_DATE_MINUS_ONE_WEEK,
  ONE_WEEK_AGO_STRING,
  OVERVIEW_OPTIONS,
  TODAY_STRING,
} from '../../constants/dates';
import type { FullDashboardConfig } from '../types/dashboardConfigTypes';

export const SUBWAY_DEFAULTS: Partial<FullDashboardConfig> = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: ONE_WEEK_AGO_STRING,
    endDate: TODAY_STRING,
  },
  singleTripConfig: {
    date: TODAY_STRING,
  },
  overviewPreset: { view: 'year' },
};

export const BUS_DEFAULTS: Partial<FullDashboardConfig> = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: BUS_MAX_DATE,
    endDate: BUS_MAX_DATE_MINUS_ONE_WEEK,
  },
  singleTripConfig: {
    date: TODAY_STRING,
  },
};

export const SYSTEM_DEFAULTS: Partial<FullDashboardConfig> = {
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
};
