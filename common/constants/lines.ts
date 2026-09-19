import type { LineObject } from '../types/lines';
import { COLORS } from './colors';

export const LINE_OBJECTS: LineObject = {
  'line-red': {
    name: 'Red Line',
    short: 'Red',
    path: 'red',
    key: 'line-red',
    color: COLORS.mbta.red,
  },
  'line-orange': {
    name: 'Orange Line',
    short: 'Orange',
    path: 'orange',
    key: 'line-orange',
    color: COLORS.mbta.orange,
  },
  'line-green': {
    name: 'Green Line',
    short: 'Green',
    path: 'green',
    key: 'line-green',
    color: COLORS.mbta.green,
  },
  'line-blue': {
    name: 'Blue Line',
    short: 'Blue',
    path: 'blue',
    key: 'line-blue',
    color: COLORS.mbta.blue,
  },
  'line-mattapan': {
    name: 'Mattapan Line',
    short: 'Mattapan',
    path: 'mattapan',
    key: 'line-mattapan',
    color: COLORS.mbta.red,
  },
  'line-bus': {
    name: 'Buses',
    short: 'Bus',
    path: 'bus',
    key: 'line-bus',
    color: COLORS.mbta.bus,
  },
  'line-commuter-rail': {
    name: 'Commuter Rail',
    short: 'Commuter Rail',
    path: 'commuter-rail',
    key: 'line-commuter-rail',
    color: COLORS.mbta.commuterRail,
  },
  'line-ferry': {
    name: 'Ferry',
    short: 'Ferry',
    path: 'ferry',
    key: 'line-ferry',
    color: COLORS.mbta.ferry,
  },
  'line-RIDE': {
    name: 'The RIDE',
    short: 'The RIDE',
    path: 'the-ride',
    key: 'line-RIDE',
    color: COLORS.mbta.ferry,
  },
};

/**
 * MBTA's "Key Bus Routes" -- the system's highest-ridership routes, held to more frequent
 * service standards. These are raw GTFS route_ids, the granularity bus trip-metrics data
 * (e.g. the speed leaderboard) is keyed by -- NOT the dashboard's curated BusRoute labels,
 * which group some of these into composites (114/116/117 rather than 114, 116, 117).
 */
export const KEY_BUS_ROUTE_IDS: string[] = [
  '1',
  '15',
  '22',
  '23',
  '28',
  '32',
  '39',
  '57',
  '66',
  '71',
  '73',
  '77',
  '111',
  '116',
  '117',
];
