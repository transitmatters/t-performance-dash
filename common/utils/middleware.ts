import type { ParsedLocation } from '@tanstack/react-router';
import {
  type CommuterRailRoute,
  type BusRoute,
  type FerryRoute,
  COMMUTER_RAIL_ROUTES,
  BUS_ROUTES,
  FERRY_ROUTES,
  RAIL_LINES,
} from '../types/lines';
import { TODAY_STRING } from '../constants/dates';
import { hrefRedirect } from './hrefRedirect';
import { isOneOf } from './objects';

type LineOrRoute =
  | { type: 'rail'; value: string }
  | { type: 'bus'; value: BusRoute }
  | { type: 'cr'; value: CommuterRailRoute }
  | { type: 'ferry'; value: FerryRoute };

const getLineOrRoute = (lineString: string): LineOrRoute | undefined => {
  const linePath = lineString.toLowerCase();
  if (RAIL_LINES.includes(linePath)) return { type: 'rail', value: linePath };
  if (isOneOf(BUS_ROUTES, lineString)) return { type: 'bus', value: lineString };
  if (isOneOf(COMMUTER_RAIL_ROUTES, lineString)) return { type: 'cr', value: lineString };
  if (isOneOf(FERRY_ROUTES, lineString)) return { type: 'ferry', value: lineString };
  return undefined;
};

export const configToQueryParams = (search: URLSearchParams) => {
  if (!search.has('config')) return undefined;

  const configArr = Array.isArray(search.get('config'))
    ? search.get('config')
    : search.get('config')?.split(',');
  if (!configArr || configArr.length !== 5) return undefined;

  const lineOrRoute = getLineOrRoute(configArr[0]);
  if (!lineOrRoute) return undefined;

  const startDate = configArr[3] || undefined;
  const endDate = configArr[4] || undefined;
  const singleOrMulti = !endDate ? 'single' : 'multi';
  const query: Record<string, string | undefined> = {
    from: configArr[1] || undefined,
    to: configArr[2] || undefined,
    ...(endDate ? { startDate, endDate } : { date: startDate }),
  };

  const queryArr = Object.entries(query).filter(
    (pair): pair is [string, string] => pair[1] !== undefined
  );
  if (lineOrRoute.type === 'bus') queryArr.push(['busRoute', lineOrRoute.value]);
  if (lineOrRoute.type === 'cr') queryArr.push(['crRoute', lineOrRoute.value]);
  if (lineOrRoute.type === 'ferry') queryArr.push(['ferryRoute', lineOrRoute.value]);

  const newQueryParams = new URLSearchParams(queryArr);

  if (lineOrRoute.type === 'rail')
    return {
      line: lineOrRoute.value,
      queryParams: newQueryParams,
      tripSection: singleOrMulti,
    };
  if (lineOrRoute.type === 'cr')
    return {
      line: 'commuter-rail',
      queryParams: newQueryParams,
      tripSection: singleOrMulti,
    };
  if (lineOrRoute.type === 'ferry')
    return {
      line: 'ferry',
      queryParams: newQueryParams,
      tripSection: singleOrMulti,
    };
  return {
    line: 'bus',
    queryParams: newQueryParams,
    tripSection: singleOrMulti,
  };
};

/** Where a v3 dashboard URL lives now, or undefined if this URL isn't a v3 one. */
export const getV3RedirectHref = (pathname: string, search: URLSearchParams) => {
  const resultParams = configToQueryParams(search);

  // handle v3 slowzones route
  if (pathname.startsWith('/slowzones')) {
    // Clone so the caller's params stay untouched.
    const newParams = new URLSearchParams(search.toString());
    // v3 permitted a slowzones view with no end date—we splice in an end date of today
    //   if needed
    if (newParams.has('startDate') && !newParams.has('endDate')) {
      newParams.set('endDate', TODAY_STRING);
    }
    return `/system/slowzones/?${newParams.toString()}`;
  }

  // handle v3 rapid transit route
  if (pathname.startsWith('/rapidtransit')) {
    if (resultParams) {
      const { line, queryParams, tripSection } = resultParams;
      return `/${line}/trips/${tripSection}/?${queryParams.toString()}`;
    }
    // A config we can't read still names its line first; send it there rather than spin forever.
    const firstField = search.get('config')?.split(',')[0];
    const lineOrRoute = firstField ? getLineOrRoute(firstField) : undefined;
    return lineOrRoute?.type === 'rail' ? `/${lineOrRoute.value}/` : '/';
  }

  // handle v3 bus route
  if (search.toString()) {
    if (resultParams && pathname.startsWith('/bus')) {
      const { queryParams, tripSection } = resultParams;
      return `/bus/trips/${tripSection}/?${queryParams.toString()}`;
    } else if (pathname.startsWith('/bus') && !search.has('busRoute')) {
      return '/bus/trips/single/?busRoute=1';
    }
  }
  return undefined;
};

/** Route `beforeLoad` hook: forwards v3 URLs before the page renders. */
export const redirectV3Route = ({ location }: { location: ParsedLocation }) => {
  const href = getV3RedirectHref(location.pathname, new URLSearchParams(location.searchStr));
  // Replace rather than push, so Back doesn't land on the v3 URL and bounce forward again.
  if (href) throw hrefRedirect(href);
};
