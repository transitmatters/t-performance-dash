import type { LineObject } from '../types/lines';
import { COLORS } from './colors';

// Colors are getters so colorblind mode applies (see colorVisionPalette).
export const LINE_OBJECTS: LineObject = {
  'line-red': {
    name: 'Red Line',
    short: 'Red',
    path: 'red',
    key: 'line-red',
    get color() {
      return COLORS.mbta.red;
    },
  },
  'line-orange': {
    name: 'Orange Line',
    short: 'Orange',
    path: 'orange',
    key: 'line-orange',
    get color() {
      return COLORS.mbta.orange;
    },
  },
  'line-green': {
    name: 'Green Line',
    short: 'Green',
    path: 'green',
    key: 'line-green',
    get color() {
      return COLORS.mbta.green;
    },
  },
  'line-blue': {
    name: 'Blue Line',
    short: 'Blue',
    path: 'blue',
    key: 'line-blue',
    get color() {
      return COLORS.mbta.blue;
    },
  },
  'line-mattapan': {
    name: 'Mattapan Line',
    short: 'Mattapan',
    path: 'mattapan',
    key: 'line-mattapan',
    get color() {
      return COLORS.mbta.red;
    },
  },
  'line-bus': {
    name: 'Buses',
    short: 'Bus',
    path: 'bus',
    key: 'line-bus',
    get color() {
      return COLORS.mbta.bus;
    },
  },
  'line-commuter-rail': {
    name: 'Commuter Rail',
    short: 'Commuter Rail',
    path: 'commuter-rail',
    key: 'line-commuter-rail',
    get color() {
      return COLORS.mbta.commuterRail;
    },
  },
  'line-ferry': {
    name: 'Ferry',
    short: 'Ferry',
    path: 'ferry',
    key: 'line-ferry',
    get color() {
      return COLORS.mbta.ferry;
    },
  },
  'line-RIDE': {
    name: 'The RIDE',
    short: 'The RIDE',
    path: 'the-ride',
    key: 'line-RIDE',
    get color() {
      return COLORS.mbta.theRide;
    },
  },
};

/**
 * MBTA's "Frequent Bus Routes" -- every route whose GTFS route_desc is "Frequent Bus". These are
 * raw GTFS route_ids, the granularity bus trip-metrics data (e.g. the speed leaderboard) is
 * keyed by -- NOT the dashboard's curated BusRoute labels, which group some routes into
 * composites. The Silver Line appears under its GTFS ids: 741/742/743/746 (SL1/SL2/SL3/SLW) and
 * 749/751 (SL5/SL4). The home scoreboard's Frequent Bus row has its own line-level list in
 * data-ingestion (chalicelib/overview/config.py).
 */
export const FREQUENT_BUS_ROUTE_IDS: string[] = [
  '1',
  '9',
  '15',
  '22',
  '23',
  '28',
  '31',
  '32',
  '39',
  '57',
  '66',
  '71',
  '73',
  '77',
  '104',
  '109',
  '110',
  '111',
  '116',
  '741',
  '742',
  '743',
  '746',
  '749',
  '751',
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

/** A retired route's label without its suffix, e.g. '60/65-legacy' -> '60/65'. */
export const stripLegacySuffix = (busRoute: string) => busRoute.replace(/-legacy$/, '');

/**
 * The route_ids a route's data is filed under. A retired route kept the route_id its replacement
 * now runs under, so '60/65-legacy' -> ['60', '65']. Callers must keep their dates within the
 * route's service window, or they'll get the replacement's data too.
 */
export const getBusRouteDataIds = (busRoute: string): string[] =>
  getBusRouteIds(stripLegacySuffix(busRoute));

/** The route_ids behind a curated label that are Frequent Bus Routes: all of SL4/SL5, but only 116
 * of 114/116/117. Empty for a route that isn't frequent. */
export const getFrequentBusRouteIds = (busRoute: string): string[] =>
  getBusRouteIds(busRoute).filter((routeId) => FREQUENT_BUS_ROUTE_IDS.includes(routeId));
