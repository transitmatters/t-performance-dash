import { capitalize, isEqual, pickBy } from 'lodash';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { Line, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route } from '../types/router';
import type { NavTab, Page } from '../constants/pages';
import { SUB_PAGES_MAP, ALL_PAGES } from '../constants/pages';
import { LINE_OBJECTS } from '../constants/lines';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};

const getParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => key !== 'line' && value)
  );
};

const getPage = (pageArray: string[]): string => {
  if (pageArray[0] === '') return 'today';
  if (pageArray[1]) {
    return SUB_PAGES_MAP[pageArray[0]][pageArray[1]];
  }
  return pageArray[0];
};

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath.split('?');
  const pathItems = path[0].split('/');
  const queryParams = router.query;
  const tab = RAIL_LINES.includes(pathItems[1]) ? 'Subway' : 'Bus';
  const page = getPage(pathItems.slice(2)) as Page;
  const newParams = getParams(queryParams);

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    page: page,
    tab: tab,
    query: router.isReady ? newParams : {},
  };
};

export const useUpdateQuery = () => {
  const router = useRouter();

  const updateQueryParams = useCallback(
    (newQueryParams: QueryParams, range?: boolean) => {
      if (!newQueryParams) return;
      if (!router.isReady) return;

      const { startDate, endDate, to, from } = newQueryParams;

      const newTempQuery: Partial<QueryParams> = {};

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
        router.push({ pathname: router.pathname, query });
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
  const currentPage = ALL_PAGES[page];
  const currentPath = currentPage.path;
  const validPage = currentPage.lines.includes('BUS');
  if (newRoute === route.query.busRoute || !validPage) {
    return `/bus/trips?busRoute=${newRoute}`;
  }
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  queryParams.append('busRoute', newRoute);
  let href = `/bus${currentPath}`;
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

export const handleTabNavigation = (
  currentPage: Page,
  tab: NavTab,
  query: QueryParams,
  linePath: LinePath,
  router: NextRouter
) => {
  // If we are on bus mode we want to keep the busRoute query param when switching sections.
  const busRouteOnly = query.busRoute ? { busRoute: query.busRoute } : undefined;

  if (ALL_PAGES[currentPage]?.section === tab.section) {
    router.push({ pathname: `/${linePath}${tab.path}`, query: query });
  } else {
    router.push({ pathname: `/${linePath}${tab.path}`, query: busRouteOnly });
  }
};
