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
