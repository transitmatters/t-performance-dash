import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { BusRoute, LinePath } from './common/types/lines';
import { BUS_ROUTES, RAIL_LINES } from './common/types/lines';

const configToQueryParams = (search: string) => {
  const queryParams = new URLSearchParams(search);
  if (!queryParams.has('config')) return;

  const configArr = Array.isArray(queryParams.get('config'))
    ? queryParams.get('config')
    : queryParams.get('config')?.split(',');
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

export function middleware(request: NextRequest) {
  const { search } = request.nextUrl;
  const resultParams = configToQueryParams(search);

  if (request.nextUrl.pathname.startsWith('/slowzones')) {
    const url = new URL(`/system/slowzones?${search.toString()}`, request.url);
    return NextResponse.redirect(url);
  }

  if (resultParams && request.nextUrl.pathname.startsWith('/rapidtransit')) {
    const { line, queryParams, tripSection } = resultParams;
    const url = new URL(`/${line}/trips/${tripSection}?${queryParams.toString()}`, request.url);
    return NextResponse.redirect(url);
  }

  if (resultParams && request.nextUrl.pathname.startsWith('/bus')) {
    const { queryParams, tripSection } = resultParams;
    const url = new URL(`/bus/trips/${tripSection}?${queryParams.toString()}`, request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/rapidtransit/:path*', '/bus', '/slowzones'],
};

const getBusOrLine = (
  lineString: string
): { type: 'rail' | 'bus'; value: LinePath | BusRoute } | undefined => {
  if (RAIL_LINES.includes(lineString.toLowerCase()))
    return { type: 'rail', value: lineString.toLowerCase() as LinePath };
  if (BUS_ROUTES.includes(lineString.toString()))
    return { type: 'bus', value: lineString as BusRoute };
};
