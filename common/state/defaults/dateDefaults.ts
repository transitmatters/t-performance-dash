import type { Tab } from '../../constants/dashboardTabs';
import type { DateStoreSection } from '../../constants/pages';
import type { DateStoreConfiguration } from '../types/dateStoreTypes';
import {
  BUS_MAX_DATE,
  BUS_MAX_DATE_MINUS_ONE_WEEK,
  ONE_WEEK_AGO_STRING,
  OVERVIEW_OPTIONS,
  TODAY_STRING,
  YESTERDAY_STRING,
  TODAY_SERVICE_STARTED,
} from '../../constants/dates';
import type { WithOptional } from '../../types/general';

export const SUBWAY_DEFAULTS: Partial<DateStoreConfiguration> = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: ONE_WEEK_AGO_STRING,
    endDate: TODAY_STRING,
  },
  singleTripConfig: {
    date: TODAY_SERVICE_STARTED ? TODAY_STRING : YESTERDAY_STRING,
  },
  overviewPreset: { view: 'year' },
};

export const BUS_DEFAULTS: WithOptional<DateStoreConfiguration, 'systemConfig' | 'overviewPreset'> =
  {
    lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
    multiTripConfig: {
      startDate: BUS_MAX_DATE_MINUS_ONE_WEEK,
      endDate: BUS_MAX_DATE,
    },
    singleTripConfig: {
      date: BUS_MAX_DATE,
    },
  };

export const SYSTEM_DEFAULTS: Partial<DateStoreConfiguration> = {
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
};

const TAB_DATE_MAP: { [key in Tab]: Partial<DateStoreConfiguration> } = {
  Subway: SUBWAY_DEFAULTS,
  Bus: BUS_DEFAULTS,
  System: SYSTEM_DEFAULTS,
};

export const getDefaultDates = (dateStoreSection: DateStoreSection, tab: Tab) => {
  const tabDefaults = TAB_DATE_MAP[tab];
  if (dateStoreSection === 'line') return tabDefaults.lineConfig;
  if (dateStoreSection === 'singleTrips') return tabDefaults.singleTripConfig;
  if (dateStoreSection === 'multiTrips') return tabDefaults.multiTripConfig;
  if (dateStoreSection === 'system') return tabDefaults.systemConfig;
};
