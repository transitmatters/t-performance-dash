import type { Tab } from '../../types/router';
import type { DateStoreSection } from '../../constants/pages';
import type { DateStoreConfiguration } from '../types/dateStoreTypes';
import {
  ONE_WEEK_AGO_STRING,
  OVERVIEW_OPTIONS,
  TODAY_STRING,
  YESTERDAY_STRING,
  TODAY_SERVICE_STARTED,
} from '../../constants/dates';
import type { WithOptional } from '../../types/general';

const SUBWAY_DEFAULTS: Partial<DateStoreConfiguration> = {
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
      startDate: ONE_WEEK_AGO_STRING,
      endDate: TODAY_STRING,
    },
    singleTripConfig: {
      date: TODAY_SERVICE_STARTED ? TODAY_STRING : YESTERDAY_STRING,
    },
  };

export const COMMUTER_RAIL_DEFAULTS: WithOptional<
  DateStoreConfiguration,
  'systemConfig' | 'overviewPreset'
> = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: ONE_WEEK_AGO_STRING,
    endDate: TODAY_STRING,
  },
  singleTripConfig: {
    date: TODAY_SERVICE_STARTED ? TODAY_STRING : YESTERDAY_STRING,
  },
};

export const FERRY_DEFAULTS: WithOptional<
  DateStoreConfiguration,
  'systemConfig' | 'overviewPreset'
> = {
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
  multiTripConfig: {
    startDate: ONE_WEEK_AGO_STRING,
    endDate: TODAY_STRING,
  },
  singleTripConfig: {
    date: TODAY_SERVICE_STARTED ? TODAY_STRING : YESTERDAY_STRING,
  },
};

const SYSTEM_DEFAULTS: Partial<DateStoreConfiguration> = {
  systemConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: TODAY_STRING },
};

const TAB_DATE_MAP: { [key in Tab]: Partial<DateStoreConfiguration> } = {
  Subway: SUBWAY_DEFAULTS,
  Bus: BUS_DEFAULTS,
  System: SYSTEM_DEFAULTS,
  'Commuter Rail': COMMUTER_RAIL_DEFAULTS,
  Ferry: BUS_DEFAULTS,
};

export const getDefaultDates = (dateStoreSection: DateStoreSection, tab: Tab) => {
  const tabDefaults = TAB_DATE_MAP[tab];
  if (dateStoreSection === 'line') return tabDefaults.lineConfig;
  if (dateStoreSection === 'singleTrips') return tabDefaults.singleTripConfig;
  if (dateStoreSection === 'multiTrips') return tabDefaults.multiTripConfig;
  if (dateStoreSection === 'system') return tabDefaults.systemConfig;
};
