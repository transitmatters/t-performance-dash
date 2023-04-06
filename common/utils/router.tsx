import { capitalize, isEqual, pickBy } from 'lodash';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { Line, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route } from '../types/router';
import type { DateParams } from '../components/inputs/DateSelection/types/DateSelectionTypes';
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

const getParams = (params: QueryParams) => {
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
  const queryParams: QueryParams = router.query;
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
    (newQueryParams: DateParams, range: boolean) => {
      if (!newQueryParams) return;

      const { startDate, endDate } = newQueryParams;

      const newDateQuery: Partial<QueryParams> = {};

      if (startDate) {
        if (startDate && typeof startDate === 'string') {
          newDateQuery.startDate = startDate;
        }
        if (range && endDate && typeof endDate === 'string') {
          newDateQuery.endDate = endDate;
        } else if (!range) {
          newDateQuery.endDate = undefined;
        }

        const newQuery = {
          ...router.query,
          ...newDateQuery,
        };

        if (!isEqual(router.query, newQuery)) {
          const query = pickBy(newQuery, (attr) => attr !== undefined);
          router.push({ pathname: router.pathname, query });
        }
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
  const validPage = line ? currentPage.lines.includes(newLine) : false;
  let href = `/${path}`;

  // Go to homepage if current line is selected or the selected page is not valid for the given line.
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
    return `/bus/singleday?busRoute=${newRoute}`;
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
  if (tab.key === 'singleday') {
    delete query.endDate;
  }

  // If we are on bus mode we want to keep the busRoute query param when switching sections.
  const busRouteOnly = query.busRoute ? { busRoute: query.busRoute } : undefined;

  if (ALL_PAGES[currentPage]?.section === tab.section) {
    router.push({ pathname: `/${linePath}${tab.path}`, query: query });
  } else {
    router.push({ pathname: `/${linePath}${tab.path}`, query: busRouteOnly });
  }
};
