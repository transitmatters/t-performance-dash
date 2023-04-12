import { capitalize, isEqual, pickBy } from 'lodash';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { DataPage } from '../types/dataPages';
import type { Line, LineMetadata, LinePath, LineShort } from '../types/lines';
import { RAIL_LINES } from '../types/lines';
import type { QueryParams, Route } from '../types/router';
import { getOffsetDate } from './date';

const linePathToKeyMap: Record<string, Line> = {
  red: 'line-red',
  orange: 'line-orange',
  green: 'line-green',
  blue: 'line-blue',
  bus: 'line-bus',
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
  if (!newParams.startDate) {
    newParams.startDate = dayjs().format('YYYY-MM-DD');
  }

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    datapage: (pathItems[2] as DataPage) || 'overview', //TODO: Remove as
    tab: tab,
    query: router.isReady ? newParams : {},
  };
};

export const useUpdateQuery = () => {
  const router = useRouter();

  const updateQueryParams = useCallback(
    (newQueryParams: QueryParams, range?: boolean) => {
      if (!newQueryParams) return;

      const { startDate, endDate, to, from } = newQueryParams;

      const newTempQuery: Partial<QueryParams> = {};

      if (startDate) {
        if (startDate && typeof startDate === 'string') {
          newTempQuery.startDate = getOffsetDate(startDate);
        }
        if (range && endDate && typeof endDate === 'string') {
          newTempQuery.endDate = getOffsetDate(endDate);
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

export const getLineSelectionItemHref = (metadata: LineMetadata, route: Route): string => {
  const { datapage, line, query } = route;
  let href = `/${metadata.path}`;

  // Go to homepage if current line is selected.
  if (metadata.key === line || datapage === 'overview') {
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

export const getBusRouteSelectionItemHref = (busRoute: string, route: Route): string => {
  const { query, datapage } = route;
  if (busRoute === route.query.busRoute || datapage === 'overview') {
    return `/bus?busRoute=${busRoute}`;
  }
  const queryParams = query
    ? new URLSearchParams(Object.entries(query).filter(([key]) => key !== 'busRoute'))
    : new URLSearchParams();
  queryParams.append('busRoute', busRoute);
  let href = '/bus';
  href += `?${queryParams.toString() ?? ''}`;
  return href;
};
