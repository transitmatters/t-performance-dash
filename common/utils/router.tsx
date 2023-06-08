import type { ParsedUrlQuery } from 'querystring';
import { capitalize, isEqual, pickBy } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { Line, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route, Tab } from '../types/router';
import { DateParams } from '../types/router';
import type { PageMetadata, Page } from '../constants/pages';
import { SYSTEM_PAGES_MAP, SUB_PAGES_MAP, ALL_PAGES } from '../constants/pages';
import type { DateConfig } from '../state/dashboardConfig';
import { useDateConfig } from '../state/dashboardConfig';
import { LINE_OBJECTS } from '../constants/lines';
import { getDateConfig, saveDateConfig } from '../state/utils/dashboardUtils';

const linePathToKeyMap: Record<string, Line> = {
  red: 'line-red',
  orange: 'line-orange',
  green: 'line-green',
  blue: 'line-blue',
  bus: 'line-bus',
};

export const getParams = (params: ParsedUrlQuery | QueryParams) => {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => key !== 'line' && value)
  );
};

export const getDateParams = (params: ParsedUrlQuery | QueryParams) => {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => key in DateParams && value)
  );
};

const getPage = (pathItems: string[], tab: Tab): string => {
  if (tab === 'System') {
    const pageArray = pathItems.slice(1);
    if (pageArray[0] === '' || pageArray[1] === '') return 'landing';
    return SYSTEM_PAGES_MAP['system'][pageArray[1]];
  }
  const pageArray = pathItems.slice(2);
  if (pageArray[0] === '') return 'today';
  if (pageArray[1]) {
    return SUB_PAGES_MAP[pageArray[0]][pageArray[1]];
  }
  return pageArray[0];
};

const getTab = (path: string) => {
  if (RAIL_LINES.includes(path)) {
    return 'Subway';
  } else if (path === 'bus') {
    return 'Bus';
  } else {
    return 'System';
  }
};

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath.split('?');
  const pathItems = path[0].split('/');
  const queryParams = router.query;
  const tab = getTab(pathItems[1] ?? 'System');
  const page = getPage(pathItems, tab) as Page;
  const newParams = getParams(queryParams);

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    page: page,
    tab,
    query: router.isReady ? newParams : {},
  };
};

export const useUpdateQuery = () => {
  const router = useRouter();

  const updateQueryParams = useCallback(
    (newQueryParams: QueryParams, range?: boolean) => {
      if (!newQueryParams) return;
      if (!router.isReady) return;

      const { startDate, endDate, to, from, date } = newQueryParams;

      const newTempQuery: Partial<QueryParams> = {};

      if (date) {
        newTempQuery.date = date;
      }

      if (startDate) {
        if (startDate && typeof startDate === 'string') {
          newTempQuery.startDate = startDate;
        }
        if (range && endDate && typeof endDate === 'string') {
          newTempQuery.endDate = endDate;
        } else if (!range) {
          newTempQuery.endDate = undefined;
        }
      }

      if (to || from) {
        if ((to && typeof to === 'string') || typeof to === 'number') {
          newTempQuery.to = to;
        }
        if ((from && typeof from === 'string') || typeof from === 'number') {
          newTempQuery.from = from;
        }
      }

      const newQuery = {
        ...router.query,
        ...newTempQuery,
      };

      if (!isEqual(router.query, newQuery)) {
        const query = pickBy(newQuery, (attr) => attr !== undefined);
        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
      }
    },
    [router]
  );

  return updateQueryParams;
};

export const getLineSelectionItemHref = (newLine: Line, route: Route): string => {
  const { page, line, query } = route;
  const { path, key } = LINE_OBJECTS[newLine];
  const currentPage = ALL_PAGES[page];
  const currentPath = currentPage.path;
  let href = `/${path}`;
  // Go to homepage if current line is selected or the selected page is not valid for the given line.
  const validPage = currentPage.lines.includes(newLine);
  if (key === line || currentPath === 'today' || !validPage) {
    return href;
  }
  delete query.from;
  delete query.to;
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  href += currentPath ? `${currentPath}` : '';
  const queryString = queryParams.toString();
  href += queryString ? `?${queryString}` : '';
  return href;
};

export const getBusRouteSelectionItemHref = (newRoute: string, route: Route): string => {
  const { query, page } = route;
  if (!page) return ''; // TODO: remove this. Only needed bc this loads on root URL at the moment.
  const currentPage = ALL_PAGES[page];
  const currentPath = currentPage.path;
  const validPage = currentPage.lines.includes('line-bus');
  if (newRoute === route.query.busRoute || !validPage) {
    return `/bus/trips?busRoute=${newRoute}`;
  }
  delete query.from;
  delete query.to;
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  queryParams.append('busRoute', newRoute);
  let href = `/bus${currentPath}`;
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

export const getHref = (
  dashboardConfig: DateConfig,
  newPage: PageMetadata,
  currentPage: Page,
  query: QueryParams,
  linePath: LinePath
) => {
  const pageObject = ALL_PAGES[currentPage];
  if (pageObject?.dateConfig === newPage.dateConfig) {
    return navigateWithinSection(linePath, newPage, query);
  }
  return navigateToNewSection(linePath, newPage, query, dashboardConfig);
};

export const useHandlePageNavigation = () => {
  const { page, query } = useDelimitatedRoute();
  const pageObject = ALL_PAGES[page];
  const dashboardConfig = useDateConfig();

  const handlePageNavigation = useCallback(
    (page: PageMetadata) => {
      if (!(pageObject?.dateConfig === page.dateConfig)) {
        saveDateConfig(pageObject.dateConfig, query, dashboardConfig);
      }
    },
    [query, pageObject, dashboardConfig]
  );
  return handlePageNavigation;
};

const navigateWithinSection = (linePath: LinePath, page: PageMetadata, query: QueryParams) => {
  return { pathname: `/${linePath}${page.path}`, query: query };
};

const navigateToNewSection = (
  linePath: LinePath,
  page: PageMetadata,
  query: QueryParams,
  dashboardConfig: DateConfig
) => {
  const params = getDateConfig(page.dateConfig, dashboardConfig);
  const busRouteOnly = query.busRoute ?? undefined;
  const newQuery = busRouteOnly ? { ...params, busRoute: busRouteOnly } : params;
  return {
    pathname: `/${page.dateConfig === 'system' ? 'system' : linePath}${page.path}`,
    query: newQuery,
  };
};
