// These throw on a URL the router should have fixed, so a bug shows as an error, not empty charts.
import type { DateRange, LinePage, PageDates, SingleDate, TripPage } from '../utils/pageParams';
import { parseLinePage, parsePageDates, parseTripPage } from '../utils/pageParams';
import { routeFromLocation, useRenderedLocation } from '../utils/router';

export class PageParamsError extends Error {
  constructor(expected: string, pathname: string) {
    super(`Expected ${expected} at ${pathname}`);
    this.name = 'PageParamsError';
  }
}

const orThrow = <T>(value: T | undefined, expected: string, pathname: string): T => {
  if (value === undefined) throw new PageParamsError(expected, pathname);
  return value;
};

const useRenderedPage = () => {
  const { pathname, search } = useRenderedLocation();
  return { pathname, route: routeFromLocation(pathname, search) };
};

export const useLinePage = (): LinePage => {
  const { pathname, route } = useRenderedPage();
  return orThrow(parseLinePage(route), 'a line', pathname);
};

const usePageDatesAt = () => {
  const { pathname, route } = useRenderedPage();
  return { pathname, dates: orThrow(parsePageDates(route), 'dates', pathname) };
};

export const usePageDates = (): PageDates => usePageDatesAt().dates;

export const useDateRange = (): DateRange => {
  const { pathname, dates } = usePageDatesAt();
  return orThrow(dates.kind === 'range' ? dates : undefined, 'a date range', pathname);
};

export const useSingleDate = (): SingleDate => {
  const { pathname, dates } = usePageDatesAt();
  return orThrow(dates.kind === 'single' ? dates : undefined, 'a single date', pathname);
};

// For the trip page itself, which explains a route with no stations. Inside it, use useTripPage.
export const useTripSelection = (): TripPage | undefined => parseTripPage(useRenderedPage().route);

export const useTripPage = (): TripPage => {
  const { pathname, route } = useRenderedPage();
  return orThrow(parseTripPage(route), 'a trip', pathname);
};
