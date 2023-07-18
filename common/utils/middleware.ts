import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { RAIL_LINES, type BusRoute, type LinePath, BUS_ROUTES } from '../types/lines';
import { TODAY_STRING } from '../constants/dates';

const getBusOrLine = (
  lineString: string
): { type: 'rail' | 'bus'; value: LinePath | BusRoute } | undefined => {
  if (RAIL_LINES.includes(lineString.toLowerCase()))
    return { type: 'rail', value: lineString.toLowerCase() as LinePath };
  if (BUS_ROUTES.includes(lineString.toString()))
    return { type: 'bus', value: lineString as BusRoute };
};

export const configToQueryParams = (search: ReadonlyURLSearchParams | URLSearchParams) => {
  if (!search.has('config')) return;

  const configArr = Array.isArray(search.get('config'))
    ? search.get('config')
    : search.get('config')?.split(',');
  if (!configArr || configArr.length !== 5) return;

  const busOrLine = getBusOrLine(configArr[0]);
  if (!busOrLine) return;

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
    string
  ][];
  if (busOrLine.type === 'bus') queryArr.push(['busRoute', busOrLine.value]);

  const newQueryParams = new URLSearchParams(queryArr);

  if (busOrLine.type === 'rail')
    return {
      line: busOrLine.value,
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
