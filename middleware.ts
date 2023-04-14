import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { BusRoute, LinePath } from './common/types/lines';
import { BUS_ROUTES, RAIL_LINES } from './common/types/lines';

const configToQueryParams = (search: string) => {
  const queryParams = new URLSearchParams(search);
  if (queryParams.has('config')) {
    const configArr = Array.isArray(queryParams.get('config'))
      ? queryParams.get('config')
      : queryParams.get('config')?.split(',');
    if (configArr && configArr.length === 5) {
      const line = RAIL_LINES.includes(configArr[0].toLowerCase())
        ? (configArr[0].toLowerCase() as LinePath)
        : undefined;
      const busRoute = BUS_ROUTES.includes(configArr[0].toString())
        ? (configArr[0] as BusRoute)
        : undefined;
      if (line) {
        const queryArr = Object.entries({
          from: configArr[1] || undefined,
          to: configArr[2] || undefined,
          startDate: configArr[3] || undefined,
          endDate: configArr[4] || undefined,
        }).filter((pair) => pair[1] !== undefined) as [string, string][];
        const queryParams = new URLSearchParams(queryArr);
        return {
          line: line,
          queryParams: queryParams,
        };
      } else if (busRoute) {
        const queryArr = Object.entries({
          from: configArr[1] || undefined,
          to: configArr[2] || undefined,
          startDate: configArr[3] || undefined,
          endDate: configArr[4] || undefined,
          busRoute: busRoute,
        }).filter((pair) => pair[1] !== undefined) as [string, string][];
        const queryParams = new URLSearchParams(queryArr);
        return {
          line: 'bus',
          queryParams: queryParams,
        };
      }
    }
  }
};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { search } = request.nextUrl;
  const resultParams = configToQueryParams(search);

  if (resultParams && request.nextUrl.pathname.startsWith('/rapidtransit')) {
    const { line, queryParams } = resultParams;
    const url = new URL(`/${line}/trips?${queryParams.toString()}`, request.url);
    return NextResponse.redirect(url);
  }

  if (resultParams && request.nextUrl.pathname.startsWith('/bus')) {
    const { queryParams } = resultParams;
    const url = new URL(`/bus/trips?${queryParams.toString()}`, request.url);
    return NextResponse.redirect(url);
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/rapidtransit/:path*', '/bus'],
};
