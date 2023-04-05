import { capitalize, isEqual, pickBy } from 'lodash';
import type { Router } from 'next/router';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { Line, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route } from '../types/router';
import type { DateParams } from '../components/inputs/DateSelection/types/DateSelectionTypes';
import type { NavTab, Page } from '../constants/pages';
import { ALL_PAGES, PATH_TO_PAGE_MAP } from '../constants/pages';
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

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath.split('?');
  const pathItems = path[0].split('/');
  const queryParams: QueryParams = router.query;
  const tab = RAIL_LINES.includes(pathItems[1]) ? 'Subway' : 'Bus';

  const newParams = getParams(queryParams);

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    page: (pathItems[2] as Page) || 'today', //TODO: Remove as
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
  const { page: datapage, line, query } = route;
  const { path, key } = LINE_OBJECTS[newLine];
  const validPage = line ? ALL_PAGES[datapage].lines.includes(newLine) : false;
  let href = `/${path}`;

  // Go to homepage if current line is selected or the selected page is not valid for the given line.
  if (key === line || datapage === 'today' || !validPage) {
    return href;
  }
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  href += datapage ? `/${datapage}` : '';
  const queryString = queryParams.toString();
  href += queryString ? `?${queryString}` : '';
  return href;
};

export const getBusRouteSelectionItemHref = (newRoute: string, route: Route): string => {
  const { query, page: datapage } = route;
  const validPage = ALL_PAGES[datapage].lines.includes('BUS');
  if (newRoute === route.query.busRoute || datapage === 'today' || !validPage) {
    return `/bus/singleday?busRoute=${newRoute}`;
  }
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  queryParams.append('busRoute', newRoute);
  let href = '/bus';
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};

export const useSelectedPage = () => {
  const router = useRouter();
  const { page: datapage } = useDelimitatedRoute();
  if (!router.isReady) return undefined;
  return PATH_TO_PAGE_MAP[datapage];
};

export const handlePageNavigation = (
  currentPage: Page,
  tab: NavTab,
  query: QueryParams,
  linePath: LinePath,
  router: Router
) => {
  if (tab.key === 'singleday') {
    delete query.endDate;
  }
  if (ALL_PAGES[currentPage].section === tab.section) {
    router.push({ pathname: `/${linePath}${tab.path}`, query: query });
  } else {
    router.push({ pathname: `/${linePath}${tab.path}` });
  }
};
