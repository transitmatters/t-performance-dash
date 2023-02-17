import { capitalize, isEqual, pickBy } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import type { DataPage } from '../types/dataPages';
import type { Line, LineMetadata, LinePath, LineShort } from '../types/lines';
import type { QueryParams, Route } from '../types/router';

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
  const { startDate, endDate, busLine } = router.query;

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    datapage: (pathItems[2] as DataPage) || 'overview', //TODO: Remove as
    query: {
      startDate: Array.isArray(startDate) ? startDate[0] : startDate,
      endDate: Array.isArray(endDate) ? endDate[0] : endDate,
      busLine: Array.isArray(busLine) ? busLine[0] : busLine ?? '22', // TODO: Remove default bus
    },
  };
};

export const useUpdateQuery = () => {
  const router = useRouter();

  const updateQueryParams = useCallback(
    (newQueryParams: Partial<QueryParams>) => {
      const newQuery = {
        ...router.query,
        ...newQueryParams,
      };

      if (!isEqual(router.query, newQuery) && newQuery.line !== undefined) {
        router.query = pickBy(newQuery, (attr) => attr !== undefined);
        router.push(router);
      }
    },
    [router]
  );

  return updateQueryParams;
};

// If a datapage is selected, stay on that datapage. If the current line is selected, go to overview.
export const getLineSelectionItemHref = (metadata: LineMetadata, route: Route): string => {
  const { datapage, line, query } = route;
  const queryParams = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined)
  ).toString();
  let href = `/${metadata.path}`;
  if (metadata.key !== line && datapage) {
    if (datapage !== 'overview') {
      href += `/${datapage}`;
    }
    if (queryParams !== '') {
      href += `?${queryParams}`;
    }
  }
  return href;
};
