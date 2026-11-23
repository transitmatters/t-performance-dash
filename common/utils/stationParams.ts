import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import type { Station } from '../types/stations';
import { parseRoutePath } from './router';
import type { SearchObject } from './searchParams';
import { validateAnySearch } from './searchSchemas';
import {
  findNearestConnectingStation,
  findNextValidStation,
  findValidDefaultStations,
  getStationInOptions,
  optionsStation,
  stopIdsForStations,
} from './stations';

const hasStopIds = (from: Station | undefined, to: Station | undefined) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(from, to);
  return Boolean(fromStopIds?.length && toStopIds?.length);
};

/**
 * The query with a valid `from` and `to` for a trip page: stops the route doesn't have fall back to
 * its defaults, a lone stop gets an other end that runs in its direction, and a trip from a station
 * to itself moves `to` one stop along (or back, from the last stop). Pages without
 * stations, and routes we have no stations for, are left alone.
 */
export const withCanonicalStations = (pathname: string, search: SearchObject): SearchObject => {
  const { line, page } = parseRoutePath(pathname);
  if (!line || !ALL_PAGES[page]?.hasStationStore) return search;

  const query = validateAnySearch(search);
  const stations = optionsStation(
    LINE_OBJECTS[line].short,
    query.busRoute,
    query.crRoute,
    query.ferryRoute
  );
  const { defaultFrom, defaultTo } = findValidDefaultStations(stations);
  const givenFrom = getStationInOptions(query.from, stations);
  const givenTo = getStationInOptions(query.to, stations);
  let fromStation = givenFrom ?? defaultFrom;
  let toStation = givenTo ?? defaultTo;

  if (fromStation && toStation && fromStation.station === toStation.station) {
    toStation =
      findNextValidStation(fromStation, stations) ??
      findNearestConnectingStation(fromStation, stations, 'from') ??
      toStation;
  } else if (!hasStopIds(fromStation, toStation)) {
    // One end came from the link and the default other end doesn't run in its direction (on bus
    // and Commuter Rail, some stops only serve one). Pick an end that does, else use the defaults.
    if (givenFrom && !givenTo) {
      toStation = findNearestConnectingStation(givenFrom, stations, 'from');
    } else if (givenTo && !givenFrom) {
      fromStation = findNearestConnectingStation(givenTo, stations, 'to');
    }
    if (!fromStation || !toStation) {
      fromStation = defaultFrom;
      toStation = defaultTo;
    }
  }

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const from = fromStopIds?.[0];
  const to = toStopIds?.[0];
  return from && to ? { ...search, from, to } : search;
};
