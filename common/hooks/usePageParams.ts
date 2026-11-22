// These throw on a URL the router should have fixed, so a bug shows as an error, not empty charts.
import type { DateRange, LinePage, PageDates, SingleDate, TripPage } from '../utils/pageParams';
import { parseLinePage, parsePageDates, parseTripPage } from '../utils/pageParams';
import { useDelimitatedRoute } from '../utils/router';

export class PageParamsError extends Error {
  constructor(expected: string, pathname: string) {
    super(`Expected ${expected} at ${pathname}`);
    this.name = 'PageParamsError';
  }
}

const orThrow = <T>(value: T | undefined, expected: string): T => {
  if (value === undefined) throw new PageParamsError(expected, window.location.pathname);
  return value;
};

export const useLinePage = (): LinePage => orThrow(parseLinePage(useDelimitatedRoute()), 'a line');

export const usePageDates = (): PageDates =>
  orThrow(parsePageDates(useDelimitatedRoute()), 'dates');

export const useDateRange = (): DateRange => {
  const dates = usePageDates();
  return orThrow(dates.kind === 'range' ? dates : undefined, 'a date range');
};

export const useSingleDate = (): SingleDate => {
  const dates = usePageDates();
  return orThrow(dates.kind === 'single' ? dates : undefined, 'a single date');
};

// For the trip page itself, which explains a route with no stations. Inside it, use useTripPage.
export const useTripSelection = (): TripPage | undefined => parseTripPage(useDelimitatedRoute());

export const useTripPage = (): TripPage => orThrow(useTripSelection(), 'a trip');
