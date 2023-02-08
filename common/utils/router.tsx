import { capitalize, isEqual } from 'lodash';
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
  const { startDate, endDate } = router.query;

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    datapage: (pathItems[2] as DataPage) || 'overview', //TODO: Remove as
    query: {
      startDate: Array.isArray(startDate) ? startDate[0] : startDate,
      endDate: Array.isArray(endDate) ? endDate[0] : endDate,
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
      if (!isEqual(router.query, newQuery)) {
        router.query = newQuery;
        router.push(router);
      }
    },
    [router]
  );

  return updateQueryParams;
};

// If a datapage is selected, stay on that datapage. If the current line is selected, go to overview.
export const getLineSelectionItemHref = (metadata: LineMetadata, route: Route): string => {
  let href = `/${metadata.path}`;
  if (metadata.key !== route.line && route.datapage) {
    if (route.datapage !== 'overview') {
      href += `/${route.datapage}`;
    }
  }
  return href;
};
