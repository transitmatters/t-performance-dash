import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import {
  type CommuterRailRoute,
  type BusRoute,
  type FerryRoute,
  type LinePath,
  COMMUTER_RAIL_ROUTES,
  BUS_ROUTES,
  FERRY_ROUTES,
  RAIL_LINES,
} from '../types/lines';
import { TODAY_STRING } from '../constants/dates';

const getLineOrRoute = (
  lineString: string | BusRoute
):
  | {
      type: 'rail' | 'bus' | 'cr' | 'ferry';
      value: LinePath | BusRoute | CommuterRailRoute | FerryRoute;
    }
  | undefined => {
  if (RAIL_LINES.includes(lineString.toLowerCase()))
    return { type: 'rail', value: lineString.toLowerCase() as LinePath };
  if (BUS_ROUTES.includes(lineString.toString() as BusRoute))
    return { type: 'bus', value: lineString as BusRoute };
  if (COMMUTER_RAIL_ROUTES.includes(lineString.toString() as CommuterRailRoute))
    return { type: 'cr', value: lineString as CommuterRailRoute };
  if (FERRY_ROUTES.includes(lineString.toString() as FerryRoute))
    return { type: 'ferry', value: lineString as FerryRoute };
};

export const configToQueryParams = (search: ReadonlyURLSearchParams | URLSearchParams) => {
  if (!search.has('config')) return;

  const configArr = Array.isArray(search.get('config'))
    ? search.get('config')
    : search.get('config')?.split(',');
  if (!configArr || configArr.length !== 5) return;

  const lineOrRoute = getLineOrRoute(configArr[0]);
  if (!lineOrRoute) return;

  const query = {
    from: configArr[1] || undefined,
    to: configArr[2] || undefined,
    startDate: configArr[3] || undefined,
    endDate: configArr[4] || undefined,
  };

  const singleOrMulti = !query.endDate ? 'single' : 'multi';

  if (singleOrMulti === 'single') {
    query['date'] = query.startDate;
    delete query.startDate;
  }

  const queryArr = Object.entries(query).filter((pair) => pair[1] !== undefined) as [
    string,
    string,
  ][];
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

export const useRewriteV3Route = () => {
  const search = useSearchParams();
  const resultParams = configToQueryParams(search);
  const router = useRouter();

  // handle v3 slowzones route
  if (router.asPath.startsWith('/slowzones')) {
    // `search` is read-only, so we have to clone it to modify
    const newParams = new URLSearchParams(search.toString());
    // v3 permitted a slowzones view with no end date—we splice in an end date of today
    //   if needed
    if (newParams.has('startDate') && !newParams.has('endDate')) {
      newParams.set('endDate', TODAY_STRING);
    }
    return router.push(`/system/slowzones/?${newParams.toString()}`);
  }

  // handle v3 rapid transit route
  if (resultParams && router.asPath.startsWith('/rapidtransit')) {
    const { line, queryParams, tripSection } = resultParams;
    return router.push(`/${line}/trips/${tripSection}/?${queryParams.toString()}`);
  }

  // handle v3 bus route
  if (search.toString()) {
    if (resultParams && router.asPath.startsWith('/bus')) {
      const { queryParams, tripSection } = resultParams;
      return router.push(`/bus/trips/${tripSection}/?${queryParams.toString()}`);
    } else if (router.asPath.startsWith('/bus')) {
      router.push('/bus/trips/single/?busRoute=1');
    }
  }
};
