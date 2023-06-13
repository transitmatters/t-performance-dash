import type { Tab } from '../../constants/dashboardTabs';
import { BUS_MAX_DATE, OVERVIEW_OPTIONS, TODAY_STRING } from '../../constants/dates';
import type { DateStoreSection } from '../../constants/pages';
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

const TAB_DATE_MAP: { [key in Tab]: DateStoreConfiguration } = {
  Subway: SUBWAY_DEFAULTS,
  Bus: BUS_DEFAULTS,
  System: SYSTEM_DEFAULTS,
};

export const getDefaultDates = (dateStoreSection: DateStoreSection, tab: Tab) => {
  const tabDefaults = TAB_DATE_MAP[tab];
  if (dateStoreSection === 'line') return tabDefaults.lineConfig;
  if (dateStoreSection === 'trips') return tabDefaults.tripConfig;
  if (dateStoreSection === 'system') return tabDefaults.systemConfig;
};
