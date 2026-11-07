import type { OverviewDatePresetKey } from '../constants/dates';
import { OverviewRangeTypes } from '../constants/dates';
import type { BusRoute, CommuterRailRoute, FerryRoute } from '../types/lines';

/**
 * Per-route `validateSearch` functions. TanStack merges a route's output over the raw search, so
 * keys no route declares (utm tags and the like) pass through, and an invalid declared key has to
 * come back as an explicit `undefined` to be hidden. Nothing here adds a default: the router merges
 * these results into the URLs it builds, and existing links must serialize the same as before.
 */

type RawSearch = Record<string, unknown>;

/** A non-empty string, or the first one of a repeated key. Never coerced, so `busRoute=1` stays `'1'`. */
const str = (value: unknown): string | undefined => {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && first !== '' ? first : undefined;
};

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): T | undefined => {
    const s = str(value);
    return values.includes(s as T) ? (s as T) : undefined;
  };

const dateSearch = (search: RawSearch) => ({
  date: str(search.date),
  startDate: str(search.startDate),
  endDate: str(search.endDate),
});

const stationSearch = (search: RawSearch) => ({
  from: str(search.from),
  to: str(search.to),
});

// Not checked against the route lists, so a newly added route works before its type does.
const routeSearch = (search: RawSearch) => ({
  busRoute: str(search.busRoute) as BusRoute | undefined,
  crRoute: str(search.crRoute) as CommuterRailRoute | undefined,
  ferryRoute: str(search.ferryRoute) as FerryRoute | undefined,
});

/**
 * Per-chart view and filter state. These ride in the URL so a copied link reproduces what the
 * sender was actually looking at — a "weekdays only" chart shared as "all days" is a different
 * claim. Each control checks its value against its own options (see useChartToggle).
 */
const dayFilterSearch = (search: RawSearch) => ({
  ttDays: str(search.ttDays),
  hwDays: str(search.hwDays),
  dwDays: str(search.dwDays),
  peak: str(search.peak),
});

const chartSearch = (search: RawSearch) => ({
  ttView: str(search.ttView),
  ...dayFilterSearch(search),
});

// Same idea for the page-level toggles on Speed, Service and Fleet.
const speedSearch = (search: RawSearch) => ({
  speedDays: str(search.speedDays),
  speedBand: str(search.speedBand),
});

const serviceSearch = (search: RawSearch) => ({
  serviceScope: str(search.serviceScope),
  day: str(search.day),
});

const fleetSearch = (search: RawSearch) => ({
  fleetScope: str(search.fleetScope),
});

const delaysSearch = (search: RawSearch) => ({
  dlView: str(search.dlView),
  /** The single cause highlighted in the total chart. */
  focus: str(search.focus),
});

const OVERVIEW_VIEWS = Object.keys(OverviewRangeTypes) as OverviewDatePresetKey[];

const overviewSearch = (search: RawSearch) => ({
  view: oneOf(OVERVIEW_VIEWS)(search.view),
  /** `?redesign=0` opts a Subway overview back into the classic page. */
  redesign: oneOf(['0'])(search.redesign),
});

export const validateLineSearch = (search: RawSearch) => ({
  ...dateSearch(search),
  ...stationSearch(search),
  ...routeSearch(search),
});

export const validateOverviewSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...overviewSearch(search),
});

export const validateTripSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...chartSearch(search),
});

export const validateSpeedSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...speedSearch(search),
});

export const validateServiceSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...serviceSearch(search),
});

export const validateFleetSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...fleetSearch(search),
});

export const validateDelaysSearch = (search: RawSearch) => ({
  ...validateLineSearch(search),
  ...delaysSearch(search),
});

export const validateSystemSearch = dateSearch;

export const validateEmbedSearch = (search: RawSearch) => ({
  ...dateSearch(search),
  /** The host page picks the theme; light unless `?theme=dark`. */
  theme: oneOf(['dark', 'light'])(search.theme),
});

/** A trip chart embed carries the trip it shows, but not the page's view toggles. */
export const validateTripEmbedSearch = (search: RawSearch) => ({
  ...validateEmbedSearch(search),
  ...stationSearch(search),
  ...routeSearch(search),
});

/** A multi-day trip chart embed also keeps its card's day filter. */
/** `?trend=1` draws the trendline, which the page turns on from the legend an embed leaves out. */
const trendSearch = (search: RawSearch) => ({
  trend: oneOf(['1'])(search.trend),
});

export const validateMultiTripEmbedSearch = (search: RawSearch) => ({
  ...validateTripEmbedSearch(search),
  ...dayFilterSearch(search),
  ...trendSearch(search),
});

/**
 * Every param any route declares. Shared components (the sidebar, date controls) read the search
 * through this rather than a route's match: they render outside the matched route, and a match's
 * search lags the location during a navigation.
 */
export const validateAnySearch = (search: RawSearch) => ({
  ...validateOverviewSearch(search),
  ...chartSearch(search),
  ...speedSearch(search),
  ...serviceSearch(search),
  ...fleetSearch(search),
  ...delaysSearch(search),
  ...validateEmbedSearch(search),
  ...trendSearch(search),
});

export type QueryParams = Partial<ReturnType<typeof validateAnySearch>>;
