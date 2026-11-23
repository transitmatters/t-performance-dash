import type { Schemas } from './apiSchemas';
import type { Line, LineShort } from './lines';
import type { Station } from './stations';

export interface DataPoint {
  route_id: string;
  direction: number;
}

export interface HeadwayPoint extends DataPoint {
  prev_route_id: string;
  current_dep_dt: string;
  previous_dep_dt: string;
  headway_time_sec: number;
  benchmark_headway_time_sec: number | null;
  threshold_flag_1?: string;
  threshold_flag_2?: string;
  threshold_flag_3?: string;
  vehicle_consist?: string;
  occupancy_status?: string | null;
  occupancy_percentage?: string | null;
  vehicle_label?: string;
}

export interface DayDelayTotals {
  date: string;
  Blue: number;
  Orange: number;
  Red: number;
  Green: number;
  Mattapan: number;
}

export type Direction = 'northbound' | 'southbound';

export type Distance = {
  [to_stop_id: string]: number;
};

export interface SlowZone {
  start: string;
  end: string;
  duration: number;
  delay: number;
  latest_delay: number | null;
  color: string;
  id: string;
  direction: Direction;
  order: number;
  from: Station;
  to: Station;
}

export type SlowZoneResponse = {
  start: string;
  end: string;
  mean_metric: number;
  duration: number;
  baseline: number;
  delay: number;
  latest_delay: number | null;
  previous_delay: number | null;
  color: Exclude<LineShort, 'Bus'>;
  fr_id: string;
  to_id: string;
};

export interface SlowZoneAllSlowResponse {
  data: SlowZoneResponse[];
  updated_on: string;
}

export interface SlowZoneDayTotalsResponse {
  data: DayDelayTotals[];
  updated_on: string;
}

/** One slow zone's delay on each day it was active. Matches a SlowZoneResponse on color, fr_id, to_id and start date. */
export interface SlowZoneDailyDelays {
  color: Exclude<LineShort, 'Bus'>;
  fr_id: string;
  to_id: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD */
  end: string;
  /** Seconds over baseline on start + i days, or null when there was no data that day. */
  delays: (number | null)[];
}

export interface SlowZoneDailyDelaysResponse {
  data: SlowZoneDailyDelays[];
  updated_on: string;
}

/** Per-fleet shares, `fleet_mix_<type>`. The spec describes them but can't list keys that vary by line. */
export type FleetMix = { [key: `fleet_mix_${string}`]: number | undefined };

/** What the fleet charts read from any mode's trip metrics. Each mode fills in its own fields. */
export interface FleetMetrics extends FleetMix {
  date: string;
  fleet_trips?: number | null;
  avg_car_age?: number | null;
  pct_new_trips?: number | null;
  avg_bus_age?: number | null;
  pct_battery_trips?: number | null;
  avg_cab_car_age?: number | null;
}

export interface SpeedTripMetrics extends FleetMetrics {
  miles_covered: number;
  total_time: number;
  count: number;
  miles_per_hour?: string;
}

export type DeliveredTripMetrics = Schemas['TripMetricsEntry'] &
  FleetMix & {
    line: Line;
    avg_car_age?: number;
    pct_new_trips?: number;
    miles_per_hour?: string;
  };

/**
 * Speed metrics for a bus route, from the DeliveredTripMetricsBus table. Unlike rail,
 * miles_covered/total_time are summed directly from observed segments rather than extrapolated,
 * but the mph formula (miles_covered / (total_time / 3600)) is the same.
 */
export type DeliveredTripMetricsBus = Schemas['BusTripMetricsEntry'] &
  FleetMix & { miles_per_hour?: string };

export type BusBandTotals = Schemas['BusBandTotals'];

/**
 * Every trip LAMP scheduled, the ones with no observed stop (an estimate of trips dropped, since a
 * bus that ran untracked looks the same), and how many of those have an MBTA waiver. From
 * 2025-12-24, whole day only, and left off when not measured rather than sent as zero.
 */
export interface BusTripCounts {
  scheduled_trips?: number | null;
  unobserved_trips?: number | null;
  unobserved_waived_trips?: number | null;
}

/** Commuter Rail cab-car fleet stats for one route, or `all`, from DeliveredTripMetricsCR. */
export type DeliveredTripMetricsCR = Schemas['CrTripMetricsEntry'] & FleetMix;

/**
 * One route's totals over a date range, as ranked by /api/busspeedleaderboard. mph is derived
 * client-side the same way as everywhere else (miles_covered / (total_time / 3600)) from figures
 * summed across the range, not averaged day-by-day.
 */
export type BusSpeedLeaderboardEntry = Schemas['BusSpeedLeaderboardEntry'];

export type LineSegmentData = {
  duration: number;
  x: string[];
  y: string[];
  id: string;
  delay: number;
  latest_delay: number | null;
  stations:
    | { fromStopIds: string[]; toStopIds: string[] }
    | { fromStopIds: undefined; toStopIds: undefined };
  color: string;
};

/** A speed restriction zone, with when its data is from (`currentAsOf`) and was fetched (`validAsOf`). */
export type SpeedRestriction = Schemas['SpeedRestrictionZone'] & {
  currentAsOf: Date;
  validAsOf: Date;
};

/** One week's predictions in one bin (`0-3 min`, `3-6 min`, `6-12 min` or `12-30 min`). */
export type TimePrediction = Schemas['TimePredictionBucket'];

export type TimePredictionWeek = Schemas['TimePredictionWeek'];

export type DayKind = 'weekday' | 'saturday' | 'sunday';

/** A day kind is missing or null when the range has none of it. */
export type ServiceLevels = Schemas['ServiceLevelsByDayKind'];

export type ScheduledService = Schemas['GetScheduledServiceResponse'];

export type ServiceHours = Schemas['ServiceHoursEntry'];

export type RidershipCount = Schemas['RidershipEntry'];

/** One week of average weekday fare validations at each gated station on a line, by parent stop ID */
export type StationRidershipWeek = Schemas['StationRidershipEntry'];

/** Average weekday riders at one bus stop, in one direction and season */
export type BusStopRidershipStop = Schemas['BusStopRidershipStop'];

export type BusStopRidershipDirection = Schemas['BusStopRidershipDirection'];

/** A bus route's ridership by stop, from the MBTA's seasonal counts of every trip */
export type BusStopRidership = Schemas['BusStopRidershipResponse'];

// The spec marks the schema nullable because `peak` and `offPeak` can be null, and OpenAPI 3.0
// can't mark a reference nullable; the counts themselves never are.
export type ReliabilityCounts = NonNullable<Schemas['ReliabilityCounts']>;

/** Headways by their ratio to the scheduled headway: ≤50%, 50–75%, 75–125% (exclusive), 125–150%, ≥150%. */
export type HeadwayCounts = Schemas['HeadwayCounts'];

/** One day, week, or month of reliability counts; see server/chalicelib/reliability.py. */
export type ReliabilityEntry = Schemas['ReliabilityEntry'];

/**
 * Riders and their passenger-weighted minutes, summed over a period; see
 * server/chalicelib/reliability.py. Divide minutes by riders for per-rider averages.
 */
export type ExcessTripTimeSums = Schemas['ExcessTripTimeSums'];

/** Sums for both directions or one, with the same sums per service period. */
export type ExcessTripTimeScope = Schemas['ExcessTripTimeScope'];

export type ExcessTripTimePeriod = keyof ExcessTripTimeScope['byPeriod'];

/** One day, week, or month of the MBTA's excess trip time for a subway line. */
export type ExcessTripTimeEntry = Schemas['ExcessTripTimeEntry'];

/** One direction's schedule, measured at its Boston terminal; see server/chalicelib/regional_rail.py. */
export type ScorecardDirection = Schemas['CrScorecardDirection'];

/** A period of one line's schedule (with `date`), or a line's summary over the range (with `routeId`). */
export type CrScorecardEntry = Schemas['CrScorecardEntry'];
