import dayjs from 'dayjs';
import { getDatePickerBounds } from '../constants/dates';
import { LINE_OBJECTS } from '../constants/lines';
import type { NotableDate } from '../constants/notableDates';
import { NOTABLE_DATES } from '../constants/notableDates';
import type { Page } from '../constants/pages';
import { ALL_PAGES } from '../constants/pages';
import type { Line } from '../types/lines';
import type { QueryParams, QueryTypeOptions, Tab } from '../types/router';
import { optionsStation, stopIdsForStations } from './stations';

/** Where a date picker sits: its kind, and the page, line and route it's on. */
export interface NotableDateContext {
  type: QueryTypeOptions;
  tab: Tab;
  page: Page;
  line: Line | undefined;
  query: QueryParams;
}

const routeOf = (query: QueryParams) => query.busRoute ?? query.crRoute ?? query.ferryRoute;

/** A line's pages show the entries about it; the System pages, the ones about several lines. */
const isAbout = (entry: NotableDate, line: Line | undefined, route: string | undefined) => {
  if (entry.route && entry.route !== route) return false;
  if (!entry.lines) return true;
  return line ? entry.lines.includes(line) : entry.lines.length > 1;
};

/** The first and last day `entry` would set on a picker of `type`, if it fits one. */
const daysFor = (entry: NotableDate, type: QueryTypeOptions) =>
  type === 'single' ? [entry.date, entry.date] : [entry.startDate, entry.endDate];

/**
 * The notable dates a date picker offers: those of its kind (a day or a period) about its line
 * and route, that its calendar can show.
 */
export const getNotableDates = ({ type, tab, page, line, query }: NotableDateContext) => {
  const route = routeOf(query);
  const { minDate, maxDate } = getDatePickerBounds(tab, page, route);
  return NOTABLE_DATES.filter((entry) => {
    const [first, last] = daysFor(entry, type);
    return (
      first !== undefined &&
      last !== undefined &&
      first >= minDate &&
      last <= maxDate &&
      isAbout(entry, line, route)
    );
  });
};

/** The stop IDs for `entry`'s trip on `line`, as the trips pages' `from` and `to` take them. */
export const getNotableTripStops = (
  entry: NotableDate,
  line: Line,
  query: Pick<QueryParams, 'busRoute' | 'crRoute' | 'ferryRoute'>
): Pick<QueryParams, 'from' | 'to'> | undefined => {
  if (!entry.trip) return undefined;
  const stations = optionsStation(
    LINE_OBJECTS[line].short,
    query.busRoute,
    query.crRoute,
    query.ferryRoute
  );
  const find = (key: string) => stations?.find((station) => station.station === key);
  const { fromStopIds, toStopIds } = stopIdsForStations(find(entry.trip.from), find(entry.trip.to));
  if (!fromStopIds?.[0] || !toStopIds?.[0]) return undefined;
  return { from: fromStopIds[0], to: toStopIds[0] };
};

/** The query that opens `entry`: its dates, and on the trips pages, its stations too. */
export const getNotableDateQuery = (
  entry: NotableDate,
  { page, line, query }: Pick<NotableDateContext, 'page' | 'line' | 'query'>
): QueryParams => {
  const dates = entry.date
    ? { date: entry.date }
    : { startDate: entry.startDate, endDate: entry.endDate };
  const stops =
    line && ALL_PAGES[page]?.hasStationStore ? getNotableTripStops(entry, line, query) : undefined;
  return { ...dates, ...stops };
};

/**
 * The entry of `entries` whose dates the query has selected. Stations don't count: the label
 * describes the day, which is still notable from any other pair of stations.
 */
export const findNotableDate = (entries: NotableDate[], query: QueryParams) =>
  entries.find((entry) =>
    entry.date
      ? entry.date === query.date
      : entry.startDate === query.startDate && entry.endDate === query.endDate
  );

/** When `entry` was, briefly: the day, or the months a period spans. */
export const formatNotableDate = (entry: NotableDate) => {
  if (entry.date) return dayjs(entry.date).format('MMM D, YYYY');
  const start = dayjs(entry.startDate);
  const end = dayjs(entry.endDate);
  return start.isSame(end, 'year')
    ? `${start.format('MMM')} – ${end.format('MMM YYYY')}`
    : `${start.format('MMM YYYY')} – ${end.format('MMM YYYY')}`;
};
