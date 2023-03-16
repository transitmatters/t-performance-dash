import { capitalize, isEqual, pickBy } from 'lodash';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { DateRangeType } from 'react-tailwindcss-datepicker/dist/types';
import type { DataPage } from '../types/dataPages';
import type { BusRoute, Line, LineMetadata, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route, Tabs } from '../types/router';
import { getOffsetDate } from './date';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath.split('?');
  const pathItems = path[0].split('/');
  const { startDate, endDate, busRoute } = router.query;
  let tab: Tabs = '';
  if (RAIL_LINES.includes(pathItems[1])) {
    tab = 'Subway';
  }
  if (pathItems[1] === 'bus') {
    tab = 'Bus';
  }
  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    datapage: (pathItems[2] as DataPage) || 'overview', //TODO: Remove as
    tab: tab,
    query: router.isReady
      ? {
          startDate: Array.isArray(startDate)
            ? startDate[0]
            : startDate ?? dayjs().format('YYYY-MM-DD'),
          endDate: Array.isArray(endDate) ? endDate[0] : endDate,
          busRoute: (Array.isArray(busRoute) ? busRoute[0] : busRoute) as BusRoute,
        }
      : { startDate: undefined, endDate: undefined, busRoute: undefined },
  };
};

export const useUpdateQuery = ({ range }: { range: boolean }) => {
  const router = useRouter();

  const updateQueryParams = useCallback(
    (newQueryParams: Partial<DateRangeType> | null) => {
      if (!newQueryParams) return;

      const { startDate, endDate } = newQueryParams;

      const newDateQuery: Partial<QueryParams> = {};

      if (startDate) {
        if (startDate && typeof startDate === 'string') {
          newDateQuery.startDate = getOffsetDate(startDate);
        }
        if (range && endDate && typeof endDate === 'string') {
          newDateQuery.endDate = getOffsetDate(endDate);
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
    [range, router]
  );

  return updateQueryParams;
};

export const getLineSelectionItemHref = (metadata: LineMetadata, route: Route): string => {
  const { datapage, line, query } = route;
  let href = `/${metadata.path}`;

  // Go to homepage if current line is selected.
  if (metadata.key === line || datapage === 'overview') {
    return href;
  }
  const queryParams = query
    ? new URLSearchParams(
        Object.entries(query).filter(([key, value]) => value !== undefined && key !== 'busRoute')
      )
    : new URLSearchParams();
  href += datapage ? `/${datapage}` : '';
  const queryString = queryParams.toString();
  href += queryString ? `?${queryString}` : '';
  return href;
};

export const getBusRouteSelectionItemHref = (busRoute: string, route: Route): string => {
  const { query, datapage } = route;
  if (busRoute === route.query.busRoute || datapage === 'overview') {
    return `/bus?busRoute=${busRoute}`;
  }
  const queryParams = query
    ? new URLSearchParams(
        Object.entries(query).filter(([key, value]) => value !== undefined && key !== 'busRoute')
      )
    : new URLSearchParams();
  queryParams.append('busRoute', busRoute);
  let href = '/bus';
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};
