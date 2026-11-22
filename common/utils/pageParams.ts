/**
 * Types for what `redirectToCanonicalSearch` guarantees about the URL before a page renders, so
 * components don't re-check it.
 */
import type { Page } from '../constants/pages';
import { LINE_OBJECTS } from '../constants/lines';
import type {
  BusRoute,
  CommuterRailRoute,
  FerryRoute,
  Line,
  LinePath,
  LineShort,
} from '../types/lines';
import type { Route, Tab } from '../types/router';
import type { Station } from '../types/stations';
import { asDate, dateKindOf } from './dateParams';
import { getStationInOptions, optionsStation, stopIdsForStations } from './stations';

export interface LinePage {
  line: Line;
  lineShort: LineShort;
  linePath: LinePath;
  tab: Tab;
  page: Page;
  busRoute?: BusRoute;
  crRoute?: CommuterRailRoute;
  ferryRoute?: FerryRoute;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SingleDate {
  date: string;
}

export type PageDates = ({ kind: 'single' } & SingleDate) | ({ kind: 'range' } & DateRange);

export interface TripPage extends LinePage {
  dates: PageDates;
  fromStation: Station;
  toStation: Station;
  fromStopIds: string[];
  toStopIds: string[];
  stations: Station[];
}

export const parseLinePage = ({ line, tab, page, query }: Route): LinePage | undefined => {
  if (!line) return undefined;
  const { short, path } = LINE_OBJECTS[line];
  return {
    line,
    lineShort: short,
    linePath: path,
    tab,
    page,
    busRoute: query.busRoute,
    crRoute: query.crRoute,
    ferryRoute: query.ferryRoute,
  };
};

export const parsePageDates = ({ page, query }: Route): PageDates | undefined => {
  const kind = dateKindOf(page);
  if (kind === 'single') {
    const date = asDate(query.date);
    return date ? { kind, date } : undefined;
  }
  if (kind === 'range') {
    const startDate = asDate(query.startDate);
    const endDate = asDate(query.endDate);
    return startDate && endDate ? { kind, startDate, endDate } : undefined;
  }
  return undefined;
};

// Undefined when the route has no stations to pick (some bus routes), which the page explains.
export const parseTripPage = (route: Route): TripPage | undefined => {
  const linePage = parseLinePage(route);
  const dates = parsePageDates(route);
  if (!linePage || !dates) return undefined;
  const { lineShort, busRoute, crRoute, ferryRoute } = linePage;
  const stations = optionsStation(lineShort, busRoute, crRoute, ferryRoute);
  const fromStation = getStationInOptions(route.query.from, stations);
  const toStation = getStationInOptions(route.query.to, stations);
  if (!stations || !fromStation || !toStation) return undefined;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  if (!fromStopIds?.length || !toStopIds?.length) return undefined;
  return { ...linePage, dates, fromStation, toStation, fromStopIds, toStopIds, stations };
};
