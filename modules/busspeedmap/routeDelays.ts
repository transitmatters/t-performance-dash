import { TIME_BANDS } from './constants';
import type {
  BusRouteDelayEntry,
  BusRouteDelaysByBand,
  BusRouteDelaysByDayType,
  BusRouteDelaysResponse,
  DayType,
  Period,
  TimeBand,
} from './types';

/** The six departure windows in the day's order, without all_day, which mixes them. */
export const ROUTE_DELAY_BANDS: TimeBand[] = TIME_BANDS.filter(({ key }) => key !== 'all_day').map(
  ({ key }) => key
);

/** A route delays file's bands for the day type on show. A daily file is keyed by band already. */
export const selectRouteDelayBands = (
  data: BusRouteDelaysResponse,
  period: Period,
  dayType: DayType
): BusRouteDelaysByBand =>
  period === 'daily'
    ? (data as BusRouteDelaysByBand)
    : ((data as BusRouteDelaysByDayType)[dayType] ?? {});

export interface RouteDelayRow {
  band: TimeBand;
  /** Undefined where the route direction had too few trips with a free flow in the band. */
  entry?: BusRouteDelayEntry;
}

/** One route direction's entry in each of the six bands, in order. */
export const routeDelayRows = (
  bands: BusRouteDelaysByBand,
  routeId: string,
  directionId: number
): RouteDelayRow[] =>
  ROUTE_DELAY_BANDS.map((band) => ({
    band,
    entry: bands[band]?.find(
      (entry) => entry.route_id === routeId && entry.direction_id === directionId
    ),
  }));

/**
 * The median trip's running time and free flow in whole minutes, and the minutes lost between
 * them. Rounded before they're subtracted, so the three always add up as shown. Lost is never
 * below zero: early in the morning a trip can run a little faster than its free flow.
 */
export const tripMinutes = (entry: BusRouteDelayEntry) => {
  const running = Math.round(entry.p50_running_time_seconds / 60);
  const freeFlow = Math.round(entry.free_flow_running_time_seconds / 60);
  return { running, freeFlow, lost: Math.max(0, running - freeFlow) };
};

export type RouteDelayCardContent =
  /** A week or month whose file has none of the chosen day type yet, e.g. no Saturday so far. */
  | { kind: 'noDays' }
  /** The days ran, but no route direction had enough trips with a free flow in any band. */
  | { kind: 'tooFew' }
  | {
      kind: 'routes';
      /** Each route with at least one band to show, in the order asked for. */
      routes: { routeId: string; rows: RouteDelayRow[] }[];
      /** The longest running time across every route, in minutes, so all share one scale. */
      longest: number;
      /** Name each route, for a combined route like SL4/SL5, even if only one has trips. */
      showRouteNames: boolean;
    };

/** What the delay card shows for the route_ids and direction on the speed map. */
export const routeDelayCardContent = (
  data: BusRouteDelaysResponse,
  period: Period,
  dayType: DayType,
  routeIds: string[],
  directionId: number
): RouteDelayCardContent => {
  if (period !== 'daily' && !(data as BusRouteDelaysByDayType)[dayType]) return { kind: 'noDays' };

  const bands = selectRouteDelayBands(data, period, dayType);
  const routes = routeIds
    .map((routeId) => ({ routeId, rows: routeDelayRows(bands, routeId, directionId) }))
    .filter(({ rows }) => rows.some(({ entry }) => entry));
  if (!routes.length) return { kind: 'tooFew' };

  // At least a minute, so the bars can't divide by zero if every trip rounds down to nothing.
  const longest = Math.max(
    1,
    ...routes.flatMap(({ rows }) =>
      rows.map(({ entry }) => (entry ? tripMinutes(entry).running : 0))
    )
  );
  return { kind: 'routes', routes, longest, showRouteNames: routeIds.length > 1 };
};
