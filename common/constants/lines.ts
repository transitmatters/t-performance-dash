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
 * MBTA's "Frequent Bus Routes" -- routes held to the frequent-service standard under the Bus
 * Network Redesign. These are raw GTFS route_ids, the granularity bus trip-metrics data
 * (e.g. the speed leaderboard) is keyed by -- NOT the dashboard's curated BusRoute labels,
 * which group some routes into composites. SL2 appears under its GTFS id, '742'.
 */
export const FREQUENT_BUS_ROUTE_IDS: string[] = [
  '11',
  '14',
  '24',
  '30',
  '40',
  '50',
  '60',
  '62',
  '64',
  '67',
  '76',
  '78',
  '85',
  '93',
  '99',
  '110',
  '111',
  '112',
  '222',
  '236',
  '245',
  '411',
  '428',
  '429',
  '430',
  '441',
  '442',
  '742',
];

/**
 * Silver Line raw GTFS route_ids don't carry their rider-facing "SL#" names -- the MBTA
 * V3 API/GTFS feed identifies them by legacy numeric ids. Bus trip-metrics data (e.g. the
 * speed leaderboard) is keyed by these ids, so map them to the branded names for display.
 */
export const BUS_ROUTE_ID_TO_DISPLAY_NAME: Record<string, string> = {
  '741': 'SL1',
  '742': 'SL2',
  '743': 'SL3',
  '751': 'SL4',
  '749': 'SL5',
  '746': 'SLW',
  '708': 'CT3',
};

export const getBusRouteDisplayName = (routeId: string): string =>
  BUS_ROUTE_ID_TO_DISPLAY_NAME[routeId] ?? routeId;

const BUS_DISPLAY_NAME_TO_ROUTE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(BUS_ROUTE_ID_TO_DISPLAY_NAME).map(([routeId, name]) => [name, routeId])
);

/**
 * Raw GTFS route_ids behind a curated BusRoute label, e.g. '114/116/117' -> ['114', '116', '117']
 * and 'SL1/SL2/SL3/SLW' -> ['741', '742', '743', '746']. Trip-metrics data is keyed by these.
 */
export const getBusRouteIds = (busRoute: string): string[] =>
  busRoute.split('/').map((name) => BUS_DISPLAY_NAME_TO_ROUTE_ID[name] ?? name);
