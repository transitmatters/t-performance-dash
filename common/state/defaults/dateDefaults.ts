import type { Tab } from '../../types/router';
import type { DateStoreSection } from '../../constants/pages';
import type { DateStoreConfiguration } from '../types/dateStoreTypes';
import {
  ONE_WEEK_AGO_STRING,
  OVERVIEW_OPTIONS,
  TODAY_STRING,
  YESTERDAY_STRING,
  TODAY_SERVICE_STARTED,
  FERRY_MAX_DATE,
  FERRY_MAX_DATE_MINUS_ONE_WEEK,
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
  lineConfig: { startDate: OVERVIEW_OPTIONS.year.startDate, endDate: FERRY_MAX_DATE },
  multiTripConfig: {
    startDate: FERRY_MAX_DATE_MINUS_ONE_WEEK,
    endDate: FERRY_MAX_DATE,
  },
  singleTripConfig: {
    date: FERRY_MAX_DATE,
  },
};

export const RIDE_DEFAULTS: WithOptional<
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
  Ferry: FERRY_DEFAULTS,
  'The RIDE': RIDE_DEFAULTS,
};

export const getDefaultDates = (dateStoreSection: DateStoreSection, tab: Tab) => {
  const tabDefaults = TAB_DATE_MAP[tab];
  if (dateStoreSection === 'line') return tabDefaults.lineConfig;
  if (dateStoreSection === 'singleTrips') return tabDefaults.singleTripConfig;
  if (dateStoreSection === 'multiTrips') return tabDefaults.multiTripConfig;
  if (dateStoreSection === 'system') return tabDefaults.systemConfig;
};
