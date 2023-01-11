import moment from 'moment';
import { MbtaMajorEvent } from './slowzones/types';

import stations_json from './stations.json';

export const PRODUCTION = 'dashboard.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = new Map([
  [PRODUCTION, 'https://dashboard-api2.transitmatters.org'],
  ['dashboard-beta.transitmatters.org', 'https://dashboard-api-beta.transitmatters.org'],
]);

// Fetch the absolute location of the API to load from; fallback to "" which
// results in a relative path for local development (which is proxied to python on tcp/5000 via react-scripts magic)
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP.get(window.location.hostname) || '';

export const colorsForLine: Record<string, string> = {
  Red: '#da291c',
  Orange: '#ed8b00',
  Blue: '#003da5',
  Green: '#00834d',
  bus: '#ffc72c',
};

export const getDateThreeMonthsAgo = () => {
  return moment.utc().subtract(3, 'months').startOf('day');
};

export const TODAY_SERVICE_DATE = () => {
  // toISOString returns in UTC.
  // I want "3am Eastern", which is UTC-07:00.
  // and when DST ends and it's actually 4am EST, that's fine too.
  const d = new Date();
  d.setHours(d.getHours() - 7);
  return d.toISOString().split('T')[0];
};

export const trainDateRange = {
  minDate: '2016-01-15',
  maxDate: 'today',
};

export const busDateRange = {
  minDate: '2018-08-01',
  maxDate: '2022-11-30',
};

export const stations = stations_json;

export const majorEvents: Record<string, MbtaMajorEvent> = {
  RedDerailment: {
    start: '2019-06-11T00:00:00Z',
    end: '2019-09-21T00:00:00Z',
    color: 'Red',
    title: 'Red line derailment',
    description:
      'A red line train derailment at JFK/UMass destroyed important signal infrastructure that took months to repair.',
    type: 'derailment',
  },
  OrangeDerailment: {
    start: '2021-03-16T00:00:00Z',
    end: '2021-04-16T00:00:00Z',
    color: 'Orange',
    title: 'Orange line derailment',
    description:
      'An orange line train derailment damaged a switch, requiring track replacement. A speed restriction followed in order to give the new track time to settle.',
    type: 'derailment',
  },
  OrangeShutdown: {
    start: '2022-08-19T00:00:00Z',
    end: '2022-09-19T00:00:00Z',
    color: 'Orange',
    title: 'Orange line shutdown',
    description:
      'The orange line was shut down for 30 days to complete deferred maintenance',
    type: 'shutdown',
  },
};
