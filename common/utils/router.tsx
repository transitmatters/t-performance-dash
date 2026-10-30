import { useLocation, useMatches, useNavigate, useRouter } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { isEqual, pickBy, startCase, toLower } from '@lodash-utils';
import type { Line, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route, Tab } from '../types/router';
import { CHART_PARAMS, DATE_PARAMS } from '../types/router';
import type { PageMetadata, Page } from '../constants/pages';
import { SYSTEM_PAGES_MAP, SUB_PAGES_MAP, ALL_PAGES } from '../constants/pages';
import { LINE_OBJECTS } from '../constants/lines';
import {
  saveDateStoreSection,
  getDateStoreSection,
  getTripHopDates,
  TRIP_SECTIONS,
} from '../state/utils/dateStoreUtils';
import type { StationStore } from '../state/stationStore';
import { useStationStore } from '../state/stationStore';
import { useDateStore } from '../state/dateStore';
import type { DateStore } from '../state/dateStore';
import { LINE_COLORS } from '../constants/colors';
import type { SearchObject } from './searchParams';
import { validateAnySearch } from './searchSchemas';

export const linePathToKeyMap: Record<LinePath, Line> = {
  red: 'line-red',
  orange: 'line-orange',
  green: 'line-green',
  blue: 'line-blue',
  mattapan: 'line-mattapan',
  bus: 'line-bus',
  'commuter-rail': 'line-commuter-rail',
  ferry: 'line-ferry',
  'the-ride': 'line-RIDE',
};

const getPage = (pathItems: string[], tab: Tab): string => {
  if (tab === 'System') {
    const pageArray = pathItems.slice(1);
    if (pageArray[0] === 'rapidtransit' || pageArray[0] === 'slowzones') return 'v3Redirect';
    if (pageArray[0] === '' || pageArray[1] === '') return 'landing';
    return SYSTEM_PAGES_MAP['system'][pageArray[1]];
  }
  const pageArray = pathItems.slice(2);
  if (pageArray[0] === '') return 'overview';
  if (pageArray[1]) {
    return SUB_PAGES_MAP[pageArray[0]]?.[pageArray[1]];
  }
  return pageArray[0];
};

const getTab = (path: LinePath): Tab => {
  if (RAIL_LINES.includes(path)) {
    return 'Subway';
  } else if (path === 'bus') {
    return 'Bus';
  } else if (path === 'commuter-rail') {
    return 'Commuter Rail';
  } else if (path === 'the-ride') {
    return 'The RIDE';
  } else if (path === 'ferry') {
    return 'Ferry';
  } else {
    return 'System';
  }
};

/** True on a 404: a route rejected its params, or nothing matched the path (`_notFound`). */
export const useIsNotFound = () =>
  useMatches({
    select: (matches) =>
      matches.some((match) => match.status === 'notFound' || match._notFound === true),
  });

/** The line, tab and page a pathname points at. Pure, so the router can use it before render. */
export const parseRoutePath = (pathname: string) => {
  // Page detection expects Next's trailing-slash paths; a hand-typed `/red/speed` still has to work.
  const pathItems = (pathname.endsWith('/') ? pathname : `${pathname}/`).split('/');
  const tab = getTab((pathItems[1] as LinePath) ?? 'System');
  return {
    pathItems,
    tab,
    page: getPage(pathItems, tab) as Page,
    line: linePathToKeyMap[pathItems[1]] as Line | undefined,
  };
};

/** An embed's path is its dashboard page's path under `/embed`, so its charts read the same line. */
const withoutEmbedPrefix = (pathname: string) =>
  pathname.startsWith('/embed/') ? pathname.slice('/embed'.length) : pathname;

/** Query keys that pick a route within a mode. Each one only means something on its own mode. */
const ROUTE_PARAMS = ['busRoute', 'crRoute', 'ferryRoute'];

const ROUTE_PARAM_FOR_LINE: Partial<Record<Line, string>> = {
  'line-bus': 'busRoute',
  'line-commuter-rail': 'crRoute',
  'line-ferry': 'ferryRoute',
};

/** The search without route params from another mode, e.g. `busRoute` on `/orange/`. */
export const stripForeignRouteParams = (pathname: string, search: SearchObject): SearchObject => {
  const { line } = parseRoutePath(withoutEmbedPrefix(pathname));
  const ownParam = line ? ROUTE_PARAM_FOR_LINE[line] : undefined;
  return pickBy(search, (_, key) => !ROUTE_PARAMS.includes(key) || key === ownParam);
};

export const useDelimitatedRoute = (): Route => {
  const { pathname, search } = useLocation();
  // Merged like TanStack merges a route's validated search, so unknown params still carry over.
  const query: QueryParams = useMemo(() => ({ ...search, ...validateAnySearch(search) }), [search]);
  const { pathItems, tab, page, line } = parseRoutePath(withoutEmbedPrefix(pathname));

  return {
    line,
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: startCase(toLower(pathItems[1]).replace('-', ' ')) as LineShort, //TODO: Remove as
    page: page,
    tab,
    query,
    color: LINE_COLORS[line ?? 'default'],
  };
};

/**
 * Rewrite the query string in place. Query-only updates (a date or station change) keep the
 * scroll position; the page itself isn't changing. Skips a no-op, since navigating to the current
 * URL still reloads the route.
 */
export const useNavigateToQuery = () => {
  const router = useRouter();
  const navigate = useNavigate();

  return useCallback(
    (update: (search: QueryParams) => QueryParams, replace = true) => {
      // The latest location, not a render's, so back-to-back updates build on each other.
      const { search } = router.latestLocation;
      const next = pickBy(update(search), (value) => value !== undefined);
      if (isEqual(next, search)) return;
      navigate({ to: './', search: next, replace, resetScroll: false });
    },
    [router, navigate]
  );
};

export const useUpdateQuery = () => {
  const navigateToQuery = useNavigateToQuery();

  return useCallback(
    (newQueryParams: QueryParams, replace = true) => {
      if (!newQueryParams) return;
      const { startDate, endDate, to, from, date } = newQueryParams;
      const newTempQuery: QueryParams = {};

      // A single date and a range never coexist in the URL: writing one clears the other.
      if (date) {
        newTempQuery.date = date;
        newTempQuery.startDate = undefined;
        newTempQuery.endDate = undefined;
      } else if (startDate || endDate) {
        if (startDate) newTempQuery.startDate = startDate;
        if (endDate) newTempQuery.endDate = endDate;
        newTempQuery.date = undefined;
      }

      if (to) newTempQuery.to = to;
      if (from) newTempQuery.from = from;

      navigateToQuery((search) => ({ ...search, ...newTempQuery }), replace);
    },
    [navigateToQuery]
  );
};

/**
 * Write one query param without disturbing the rest of the URL. Passing `undefined` removes the key,
 * which is how a control at its default value keeps itself out of the query string.
 */
export const useSetQueryParam = () => {
  const navigateToQuery = useNavigateToQuery();

  return useCallback(
    (key: keyof QueryParams, value: string | undefined) =>
      navigateToQuery((search) => ({ ...search, [key]: value })),
    [navigateToQuery]
  );
};

/** The query as URL params, without the given keys; leaves `query` itself alone. */
const queryWithout = (query: QueryParams, keys: string[]) =>
  new URLSearchParams(
    Object.entries(query).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && !keys.includes(entry[0])
    )
  );

export const getLineSelectionItemHref = (newLine: Line, route: Route): string => {
  const { page, line, query } = route;
  const { path, key } = LINE_OBJECTS[newLine];
  const currentPage = ALL_PAGES[page];
  if (!currentPage) return `/${path}`;
  const currentPath = currentPage.path;
  let href = `/${path}`;
  // Go to homepage if current line is selected or the selected page is not valid for the given line.
  const validPage = currentPage.lines.includes(newLine);
  if (key === line || currentPath === 'today' || !validPage) {
    return href;
  }
  // Drop stations, route params and view (a per-line preset selection, e.g. the Overview page's
  // date range — carrying it to a different line makes that line's page open on whatever range was
  // last picked instead of its own default).
  const queryParams = queryWithout(query, ['from', 'to', 'view', ...ROUTE_PARAMS]);
  href += currentPath ? `${currentPath}` : '';
  const queryString = queryParams.toString();
  href += queryString ? `?${queryString}` : '';
  return href;
};

export const getBusRouteSelectionItemHref = (newRoute: string, route: Route): string => {
  const { query, page } = route;
  const currentPage = ALL_PAGES[page] ?? ALL_PAGES['singleTrips'];
  const currentPath = currentPage.path;
  const validPage = currentPage.lines.includes('line-bus');
  if (newRoute === route.query.busRoute || !validPage) {
    return `/bus/trips/single?busRoute=${newRoute}`;
  }
  const queryParams = queryWithout(query, ['from', 'to', 'busRoute']);
  queryParams.append('busRoute', newRoute);
  let href = `/bus${currentPath}`;
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

/**
 * Unlike getBusRouteSelectionItemHref, this deliberately navigates rather than reparameterizing
 * the current page -- the leaderboard's "by route" view has no filtered view of its own to land
 * on, only the speed map does (via the same `busRoute` param, resolved there against the loaded
 * tileset's route_ids -- see BusSpeedMapDetails).
 */
export const getBusSpeedMapRouteHref = (newRoute: string, route: Route): string => {
  const { query } = route;
  const queryParams = queryWithout(query, ['from', 'to', 'busRoute']);
  queryParams.append('busRoute', newRoute);
  return `/bus/speedmap?${queryParams.toString()}`;
};

export const getCommuterRailRouteSelectionItemHref = (newRoute: string, route: Route): string => {
  const { query, page } = route;
  const currentPage = ALL_PAGES[page] ?? ALL_PAGES['singleTrips'];
  const currentPath = currentPage.path;
  const validPage = currentPage.lines.includes('line-commuter-rail');
  if (newRoute === route.query.crRoute || !validPage) {
    return `/commuter-rail/trips/single?crRoute=${newRoute}`;
  }
  const queryParams = queryWithout(query, ['from', 'to', 'crRoute']);
  queryParams.append('crRoute', newRoute);
  let href = `/commuter-rail${currentPath}`;
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

export const getFerryRouteSelectionItemHref = (newRoute: string, route: Route): string => {
  const { query, page } = route;
  const currentPage = ALL_PAGES[page] ?? ALL_PAGES['singleTrips'];
  const currentPath = currentPage.path;
  const validPage = currentPage.lines.includes('line-ferry');
  if (newRoute === route.query.ferryRoute || !validPage) {
    return `/ferry/trips/single?ferryRoute=${newRoute}`;
  }
  const queryParams = queryWithout(query, ['from', 'to', 'ferryRoute']);
  queryParams.append('ferryRoute', newRoute);
  let href = `/ferry${currentPath}`;
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

export const useGenerateHref = () => {
  const dateStore = useDateStore();
  const stationStore = useStationStore();

  const generateHref = useCallback(
    (
      newPage: PageMetadata,
      currentPageName: Page | string,
      query: QueryParams,
      linePath: LinePath
    ) => {
      const currentPage = ALL_PAGES[currentPageName] ?? undefined;
      const newQuery = getQueryParams(currentPage, newPage, query, dateStore, stationStore);
      const newPathName = getPathName(newPage, linePath);
      return {
        pathname: newPathName,
        query: newQuery,
      };
    },
    [dateStore, stationStore]
  );
  return generateHref;
};

// TODO: We should probably use this anywhere we have links to consolidate the logic. i.e. components like <LineSelection>
export const useHandleConfigStore = () => {
  const { page, query } = useDelimitatedRoute();
  const currentPage = ALL_PAGES[page];
  const dateStore = useDateStore();
  const stationStore = useStationStore();

  const handlePageConfig = useCallback(
    (newPage: PageMetadata) => {
      if (currentPage)
        savePageConfigIfNecessary(currentPage, newPage, query, dateStore, stationStore);
    },
    [query, currentPage, dateStore, stationStore]
  );
  return handlePageConfig;
};

const getDateQueryParams = (
  currentPage: PageMetadata | undefined,
  newPage: PageMetadata,
  query: QueryParams,
  dateStore: DateStore
) => {
  if (!currentPage) {
    return getDateStoreSection(newPage.dateStoreSection, dateStore);
  }
  if (currentPage.dateStoreSection === newPage.dateStoreSection) {
    return Object.fromEntries(Object.entries(query).filter(([key]) => DATE_PARAMS.includes(key)));
  }
  if (currentPage.dateStoreSection !== newPage.dateStoreSection) {
    // Between the two trip views, what is on screen beats what is in the store.
    const hopDates = getTripHopDates(currentPage.dateStoreSection, newPage.dateStoreSection, query);
    if (hopDates) return hopDates;
    return getDateStoreSection(newPage.dateStoreSection, dateStore);
  }
};

/**
 * Chart view state survives the single/multi hop — the two views share these controls, and a day
 * filter means the same thing on both. It is dropped anywhere else, so it can't follow the user
 * onto pages that never asked for it.
 */
const getChartQueryParams = (
  currentPage: PageMetadata | undefined,
  newPage: PageMetadata,
  query: QueryParams
) => {
  if (!currentPage) return undefined;
  if (
    !TRIP_SECTIONS.includes(currentPage.dateStoreSection) ||
    !TRIP_SECTIONS.includes(newPage.dateStoreSection)
  ) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(query).filter(([key, value]) => CHART_PARAMS.includes(key) && value)
  );
};

const getBusRouteQueryParam = (newPage: PageMetadata, query: QueryParams) => {
  if (newPage.hasRouteSelector === false) return;
  if (query.busRoute) return { busRoute: query.busRoute };
  if (newPage.defaultBusRoute) return { busRoute: newPage.defaultBusRoute };
};

const getCRRouteQueryParam = (newPage: PageMetadata, query: QueryParams) => {
  if (newPage.hasRouteSelector === false) return;
  if (query.crRoute) return { crRoute: query.crRoute };
};

const getFerryRouteQueryParam = (newPage: PageMetadata, query: QueryParams) => {
  if (newPage.hasRouteSelector === false) return;
  if (query.ferryRoute) return { ferryRoute: query.ferryRoute };
};

const getStationQueryParams = (
  currentPage: PageMetadata | undefined,
  newPage: PageMetadata,
  query: QueryParams,
  stationStore: StationStore
) => {
  if (!newPage.hasStationStore) return null;
  if (currentPage && currentPage.hasStationStore && query.from && query.to)
    return { from: query.from, to: query.to };
  if (newPage.hasStationStore && stationStore.from && stationStore.to)
    return { from: stationStore.from, to: stationStore.to };
};

const getQueryParams = (
  currentPage: PageMetadata | undefined,
  newPage: PageMetadata,
  query: QueryParams,
  dateStore: DateStore,
  stationStore: StationStore
) => {
  return {
    ...getStationQueryParams(currentPage, newPage, query, stationStore),
    ...getDateQueryParams(currentPage, newPage, query, dateStore),
    ...getChartQueryParams(currentPage, newPage, query),
    ...getBusRouteQueryParam(newPage, query),
    ...getCRRouteQueryParam(newPage, query),
    ...getFerryRouteQueryParam(newPage, query),
  };
};

const getPathName = (newPage: PageMetadata, linePath: LinePath) => {
  return `/${newPage.dateStoreSection === 'system' ? 'system' : linePath}${newPage.path}`;
};

const savePageConfigIfNecessary = (
  currentPage: PageMetadata,
  newPage: PageMetadata,
  query: QueryParams,
  dateStore: DateStore,
  stationStore: StationStore
) => {
  if (!(currentPage.dateStoreSection === newPage.dateStoreSection)) {
    saveDateStoreSection(currentPage.dateStoreSection, query, dateStore);
  }
  if (!(currentPage.hasStationStore === newPage.hasStationStore)) {
    stationStore.setStationStore({ from: query.from, to: query.to });
  }
};
