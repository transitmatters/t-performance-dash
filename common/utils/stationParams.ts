import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import type { BusRoute, CommuterRailRoute, FerryRoute } from '../types/lines';
import { parseRoutePath } from './router';
import type { SearchObject } from './searchParams';
import {
  findNextValidStation,
  findValidDefaultStations,
  getStationInOptions,
  optionsStation,
  stopIdsForStations,
} from './stations';

const asString = (value: SearchObject[string]) => (typeof value === 'string' ? value : undefined);

/**
 * The query with a valid `from` and `to` for a trip page: stops the route doesn't have fall back to
 * its defaults, and a trip from a station to itself moves `to` one stop along. Pages without
 * stations, and routes we have no stations for, are left alone.
 */
export const withCanonicalStations = (pathname: string, search: SearchObject): SearchObject => {
  const { line, page } = parseRoutePath(pathname);
  if (!line || !ALL_PAGES[page]?.hasStationStore) return search;

  const stations = optionsStation(
    LINE_OBJECTS[line].short,
    asString(search.busRoute) as BusRoute | undefined,
    asString(search.crRoute) as CommuterRailRoute | undefined,
    asString(search.ferryRoute) as FerryRoute | undefined
  );
  const { defaultFrom, defaultTo } = findValidDefaultStations(stations);
  const fromStation = getStationInOptions(asString(search.from), stations) ?? defaultFrom;
  let toStation = getStationInOptions(asString(search.to), stations) ?? defaultTo;
  if (fromStation && toStation && fromStation.station === toStation.station) {
    toStation = findNextValidStation(fromStation, stations) ?? toStation;
  }

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const from = fromStopIds?.[0];
  const to = toStopIds?.[0];
  return from && to ? { ...search, from, to } : search;
};
