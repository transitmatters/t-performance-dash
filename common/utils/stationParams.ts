import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import { parseRoutePath } from './router';
import type { SearchObject } from './searchParams';
import { validateAnySearch } from './searchSchemas';
import {
  findNextValidStation,
  findValidDefaultStations,
  getStationInOptions,
  optionsStation,
  stopIdsForStations,
} from './stations';

/**
 * The query with a valid `from` and `to` for a trip page: stops the route doesn't have fall back to
 * its defaults, and a trip from a station to itself moves `to` one stop along. Pages without
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
  const fromStation = getStationInOptions(query.from, stations) ?? defaultFrom;
  let toStation = getStationInOptions(query.to, stations) ?? defaultTo;
  if (fromStation && toStation && fromStation.station === toStation.station) {
    toStation = findNextValidStation(fromStation, stations) ?? toStation;
  }

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const from = fromStopIds?.[0];
  const to = toStopIds?.[0];
  return from && to ? { ...search, from, to } : search;
};
