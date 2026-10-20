import dayjs from 'dayjs';
import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import { isEqual, pickBy } from '@lodash-utils';
import { DATE_FORMAT, getDatePickerBounds } from '../constants/dates';
import type { DateStoreSection, Page } from '../constants/pages';
import { ALL_PAGES } from '../constants/pages';
import { getDefaultDates } from '../state/defaults/dateDefaults';
import { useDateStore } from '../state/dateStore';
import { getDateStoreSection } from '../state/utils/dateStoreUtils';
import type { BusRoute, CommuterRailRoute } from '../types/lines';
import type { Tab } from '../types/router';
import { parseRoutePath } from './router';
import type { SearchObject } from './searchParams';
import { stringifySearch } from './searchParams';

type DateQuery = { date?: string; startDate?: string; endDate?: string };

const RANGE_SECTIONS: DateStoreSection[] = ['line', 'system', 'multiTrips'];
const SINGLE_SECTIONS: DateStoreSection[] = ['singleTrips'];

/** Only used if a tab has no default range for the section, which none do today. */
const FALLBACK_WINDOW_DAYS = 7;

/** The value as a date if it is a real `YYYY-MM-DD` day; empty, malformed and rolled-over dates aren't. */
const asDate = (value: unknown): string | undefined =>
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
  fallback: DateQuery
) => {
  const date =
    asDate(search.date) ??
    asDate(search.endDate) ??
    asDate(search.startDate) ??
    asDate(fallback.date) ??
    maxDate;
  return { date: clamp(date, minDate, maxDate) };
};

interface NormalizeDateParamsArgs {
  section: DateStoreSection;
  tab: Tab;
  page: Page;
  search: SearchObject;
  /** The session's last complete selection for this section, preferred over the tab default. */
  stored?: DateQuery;
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
}: NormalizeDateParamsArgs): SearchObject | undefined => {
  const isRange = RANGE_SECTIONS.includes(section);
  if (!isRange && !SINGLE_SECTIONS.includes(section)) return undefined;

  const route = (search.busRoute ?? search.crRoute) as BusRoute | CommuterRailRoute | undefined;
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
    dates = normalizeSingle(search, bounds, asDate(stored.date) ? stored : defaults);
  }

  const normalized = pickBy(
    { ...search, date: undefined, startDate: undefined, endDate: undefined, ...dates },
    (value) => value !== undefined
  ) as SearchObject;
  return isEqual(normalized, search) ? undefined : normalized;
};

/** Where to send a URL that is missing, or has broken, dates for its page. */
export const getDateRedirectHref = (pathname: string, search: SearchObject) => {
  const { tab, page, line } = parseRoutePath(pathname);
  const pageMetadata = ALL_PAGES[page];
  // Not a dated page, or a page this line doesn't have (the route 404s it).
  if (!pageMetadata || (line && !pageMetadata.lines.includes(line))) return undefined;

  const section = pageMetadata.dateStoreSection;
  const stored = getDateStoreSection(section, useDateStore.getState()) as DateQuery;
  const normalized = normalizeDateParams({ section, tab, page, search, stored });
  return normalized ? `${pathname}${stringifySearch(normalized)}` : undefined;
};

/**
 * Runs before every navigation, so no link, back button or hand-edited URL can render a dated page
 * without its dates. Replace rather than push, so Back doesn't land on the broken URL again.
 */
export const redirectToCompleteDates = ({ location }: { location: ParsedLocation }) => {
  const href = getDateRedirectHref(location.pathname, location.search);
  if (href) {
    const hash = location.hash ? `#${location.hash}` : '';
    throw redirect({ href: `${href}${hash}`, replace: true } as Parameters<typeof redirect>[0]);
  }
};
