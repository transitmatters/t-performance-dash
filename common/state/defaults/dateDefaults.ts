import { BUS_MAX_DATE, OVERVIEW_OPTIONS, TODAY_STRING } from '../../constants/dates';
import type { DateStoreConfiguration } from '../types/dateStoreTypes';

export const SUBWAY_DEFAULTS: DateStoreConfiguration = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: TODAY_STRING, queryType: 'single' },
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  overviewPreset: { view: 'year' },
};

export const BUS_DEFAULTS: DateStoreConfiguration = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: BUS_MAX_DATE, queryType: 'single' },
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  overviewPreset: undefined,
};

export const SYSTEM_DEFAULTS: DateStoreConfiguration = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  tripConfig: { startDate: BUS_MAX_DATE, queryType: 'single' },
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  overviewPreset: undefined,
};
