import dayjs from 'dayjs';
import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import { isEqual, pickBy } from '@lodash-utils';
import { DATE_FORMAT, getDatePickerBounds } from '../constants/dates';
import type { DateStoreSection, Page } from '../constants/pages';
import { ALL_PAGES } from '../constants/pages';
import { queryClient } from '../api/queryClient';
import { getDefaultDates } from '../state/defaults/dateDefaults';
import { useDateStore } from '../state/dateStore';
import { getDateStoreSection } from '../state/utils/dateStoreUtils';
import type { BusRoute, CommuterRailRoute, FerryRoute } from '../types/lines';
import type { Tab } from '../types/router';
import { parseRoutePath, stripForeignRouteParams, withDefaultRouteParam } from './router';
import type { SearchObject } from './searchParams';
import { withCanonicalStations } from './stationParams';
import { stringifySearch } from './searchParams';

type DateQuery = { date?: string; startDate?: string; endDate?: string };

const RANGE_SECTIONS: DateStoreSection[] = ['line', 'system', 'multiTrips'];
const SINGLE_SECTIONS: DateStoreSection[] = ['singleTrips'];

/** Whether a page's dates are a range (`startDate`, `endDate`) or one day (`date`), if it has any. */
export const dateKindOf = (page: Page): 'range' | 'single' | undefined => {
  const section = ALL_PAGES[page]?.dateStoreSection;
  if (!section) return undefined;
  if (RANGE_SECTIONS.includes(section)) return 'range';
  if (SINGLE_SECTIONS.includes(section)) return 'single';
  return undefined;
};

/** Only used if a tab has no default range for the section, which none do today. */
const FALLBACK_WINDOW_DAYS = 7;

/** The value as a date if it is a real `YYYY-MM-DD` day; empty, malformed and rolled-over dates aren't. */
/** The value, if it is a real `YYYY-MM-DD` date. */
export const asDate = (value: unknown): string | undefined =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  dayjs(value).format(DATE_FORMAT) === value
    ? value
    : undefined;

// `YYYY-MM-DD` strings sort chronologically, so plain comparison is enough here.
const clamp = (date: string, minDate: string, maxDate: string) =>
  date < minDate ? minDate : date > maxDate ? maxDate : date;
const shift = (date: string, days: number) => dayjs(date).add(days, 'day').format(DATE_FORMAT);

const normalizeRange = (
  search: SearchObject,
  { minDate, maxDate }: { minDate: string; maxDate: string },
  fallback: DateQuery,
  windowDays: number
) => {
  let startDate = asDate(search.startDate);
  let endDate = asDate(search.endDate);
  if (!startDate && !endDate) {
    // A single day carried onto a range page anchors the range's end.
    endDate = asDate(search.date);
    if (!endDate) {
      startDate = asDate(fallback.startDate);
      endDate = asDate(fallback.endDate);
    }
  }
  // A start with no end reads as "since then".
  endDate ??= maxDate;
  startDate ??= shift(endDate, -windowDays);
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

  startDate = clamp(startDate, minDate, maxDate);
  endDate = clamp(endDate, minDate, maxDate);
  // Both ends past the same bound collapse to one day; reopen the default window inside the bounds.
  if (startDate >= endDate) startDate = clamp(shift(endDate, -windowDays), minDate, maxDate);
  if (startDate >= endDate) endDate = clamp(shift(startDate, windowDays), minDate, maxDate);
  return { startDate, endDate };
};

const normalizeSingle = (
  search: SearchObject,
  { minDate, maxDate }: { minDate: string; maxDate: string },
  fallback: DateQuery,
  latestDate = maxDate
) => {
  const date = asDate(search.date) ?? asDate(search.endDate) ?? asDate(search.startDate);
  if (date) return { date: clamp(date, minDate, maxDate) };
  return { date: clamp(asDate(fallback.date) ?? latestDate, minDate, latestDate) };
};

interface NormalizeDateParamsArgs {
  section: DateStoreSection;
  tab: Tab;
  page: Page;
  search: SearchObject;
  /** The session's last complete selection for this section, preferred over the tab default. */
  stored?: DateQuery;
  /**
   * The newest day with data, when it can trail the picker's max date. A date the URL doesn't
   * name opens no later than this; one it does name can still go up to the max.
   */
  latestDate?: string;
}

/**
 * The search with a complete, ordered, in-bounds set of dates for the page: `date` on single-day
 * pages, `startDate` and `endDate` on range pages. Undefined when the search already has one, or
 * the page doesn't take dates.
 */
export const normalizeDateParams = ({
  section,
  tab,
  page,
  search,
  stored = {},
  latestDate,
}: NormalizeDateParamsArgs): SearchObject | undefined => {
  const isRange = RANGE_SECTIONS.includes(section);
  if (!isRange && !SINGLE_SECTIONS.includes(section)) return undefined;

  const route = (search.busRoute ?? search.crRoute ?? search.ferryRoute) as
    | BusRoute
    | CommuterRailRoute
    | FerryRoute
    | undefined;
  const bounds = getDatePickerBounds(tab, page, route);
  const defaults: DateQuery = getDefaultDates(section, tab) ?? {};

  let dates: DateQuery;
  if (isRange) {
    const fallback = asDate(stored.startDate) && asDate(stored.endDate) ? stored : defaults;
    const windowDays =
      defaults.startDate && defaults.endDate
        ? dayjs(defaults.endDate).diff(defaults.startDate, 'day')
        : FALLBACK_WINDOW_DAYS;
    dates = normalizeRange(search, bounds, fallback, windowDays);
  } else {
    dates = normalizeSingle(search, bounds, asDate(stored.date) ? stored : defaults, latestDate);
  }

  const normalized = pickBy(
    { ...search, date: undefined, startDate: undefined, endDate: undefined, ...dates },
    (value) => value !== undefined
  ) as SearchObject;
  return isEqual(normalized, search) ? undefined : normalized;
};

/** Where to send a URL that is missing, or has broken, dates for its page. */
export const getDateRedirectHref = (
  pathname: string,
  search: SearchObject,
  latestDate?: string
) => {
  const { tab, page, line } = parseRoutePath(pathname);
  const pageMetadata = ALL_PAGES[page];
  // Not a dated page, or a page this line doesn't have (the route 404s it).
  if (!pageMetadata || (line && !pageMetadata.lines.includes(line))) return undefined;

  const section = pageMetadata.dateStoreSection;
  const stored = getDateStoreSection(section, useDateStore.getState()) as DateQuery;
  const normalized = normalizeDateParams({ section, tab, page, search, stored, latestDate });
  return normalized ? `${pathname}${stringifySearch(normalized)}` : undefined;
};

/**
 * Where to send a URL whose query doesn't fit its page: a route param from another mode (the line
 * would render as that route), a missing route on a bus, Commuter Rail or ferry page, missing or
 * invalid stations on a trip page, or missing or broken dates. Route params go first, since they set
 * the stations and the date bounds.
 */
export const getCanonicalSearchHref = (
  pathname: string,
  search: SearchObject,
  latestDate?: string
) => {
  const stripped = withCanonicalStations(
    pathname,
    withDefaultRouteParam(pathname, stripForeignRouteParams(pathname, search))
  );
  const dateHref = getDateRedirectHref(pathname, stripped, latestDate);
  if (dateHref) return dateHref;
  return isEqual(stripped, search) ? undefined : `${pathname}${stringifySearch(stripped)}`;
};

/**
 * The bus speed map and Rankings read files published a day or more in arrears. Opened without a
 * date, they wait for a check of whether yesterday's is out yet rather than open on an empty day.
 */
const opensOnLatestBusSpeedDate = (pathname: string, search: SearchObject) => {
  const { line, page } = parseRoutePath(pathname);
  return (
    line === 'line-bus' &&
    (page === 'speedmap' || page === 'leaderboard') &&
    !asDate(search.date) &&
    !asDate(search.startDate) &&
    !asDate(search.endDate)
  );
};

const throwCanonicalRedirect = (location: ParsedLocation, latestDate?: string) => {
  const href = getCanonicalSearchHref(location.pathname, location.search, latestDate);
  if (href) {
    const hash = location.hash ? `#${location.hash}` : '';
    throw redirect({ href: `${href}${hash}`, replace: true } as Parameters<typeof redirect>[0]);
  }
};

/**
 * Runs before every navigation, so no link, back button or hand-edited URL can render a page with a
 * query that doesn't fit it. Replace rather than push, so Back doesn't land on the broken URL again.
 */
export const redirectToCanonicalSearch = ({ location }: { location: ParsedLocation }) => {
  if (!opensOnLatestBusSpeedDate(location.pathname, location.search)) {
    return throwCanonicalRedirect(location);
  }
  return import('../api/hooks/busSpeedSegments')
    .then(({ latestBusSpeedDateQuery }) => queryClient.ensureQueryData(latestBusSpeedDateQuery))
    .then((latestDate) => throwCanonicalRedirect(location, latestDate));
};
