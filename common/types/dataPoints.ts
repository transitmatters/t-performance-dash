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

/** Fleet stats from data-ingestion. Each mode fills in its own share and age fields. */
export interface FleetMetrics {
  date: string;
  fleet_trips?: number;
  avg_car_age?: number;
  pct_new_trips?: number;
  avg_bus_age?: number;
  pct_battery_trips?: number;
  avg_cab_car_age?: number;
  [key: `fleet_mix_${string}`]: number | undefined;
}

export interface SpeedTripMetrics extends FleetMetrics {
  miles_covered: number;
  total_time: number;
  count: number;
  miles_per_hour?: string;
}

export interface DeliveredTripMetrics extends SpeedTripMetrics {
  line: Line;
}

/**
 * Daily speed metrics for a single bus route, from the DeliveredTripMetricsBus table.
 * Unlike rail, miles_covered/total_time are summed directly from observed segments
 * rather than extrapolated, but the mph formula (miles_covered / (total_time / 3600))
 * is the same.
 */
export interface DeliveredTripMetricsBus
  extends SpeedTripMetrics, BusTripCounts, Partial<HeadwayCounts> {
  route: string;
  n_traversals: number;
  n_interpolated: number;
  // The headway counts are at mid-route timepoints, whole day only, and from 2025-12-24 on.
  // Whole-day, daily rows only: a median or mean can't be split by time band or summed into a
  // week or month.
  median_speed_mph?: number;
  mean_speed_mph?: number;
  // Fleet fields, daily rows only (the `fleet_mix_*` shares are on SpeedTripMetrics). Route `all`
  // is the whole system and carries only these.
  fleet_trips?: number;
  pct_battery_trips?: number;
  avg_bus_age?: number;
  // The same totals split by departure window (keys are TIME_BANDS minus `all_day`), on daily rows
  // and weekly/monthly rollups alike. Absent before the pipeline began recording it (2025-12-24) and
  // when the request set `time_band`; a band with no traversals is zeros or missing.
  time_bands?: Partial<Record<string, BusBandTotals>>;
}

export interface BusBandTotals {
  count: number;
  n_traversals: number;
  n_interpolated: number;
  miles_covered: number;
  total_time: number;
}

/**
 * Every trip LAMP scheduled, the ones with no observed stop (an estimate of trips dropped, since a
 * bus that ran untracked looks the same), and how many of those have an MBTA waiver. From
 * 2025-12-24, whole day only, and left off when not measured rather than sent as zero.
 */
export interface BusTripCounts {
  scheduled_trips?: number;
  unobserved_trips?: number;
  unobserved_waived_trips?: number;
}

/** Commuter Rail cab-car fleet stats for one route, or `all`, from DeliveredTripMetricsCR. */
export interface DeliveredTripMetricsCR extends FleetMetrics {
  route: string;
}

/**
 * One route's totals over a date range, as ranked by /api/busspeedleaderboard. mph is
 * derived client-side the same way as everywhere else (miles_covered / (total_time / 3600))
 * from figures summed across the range, not averaged day-by-day.
 *
 * total_time runs arrival to arrival, so it includes the time around stops in total_dwell.
 * Average dwell is total_dwell / n_dwell_stops. The dwell fields and n_days (days with speed
 * data) are missing from leaderboards computed before they were added.
 *
 * Routes with fleet data also have its stats for the range, each day weighted by the trips it
 * sampled (`fleet_trips`). The API sends avg_bus_age and the fleet_mix_* shares too; only the
 * fields the leaderboard ranks by are typed here.
 */
export interface BusSpeedLeaderboardEntry extends BusTripCounts, Partial<HeadwayCounts> {
  route: string;
  miles_covered: number;
  total_time: number;
  count: number;
  n_traversals: number;
  total_dwell?: number;
  n_dwell_stops?: number;
  n_days?: number;
  fleet_trips?: number;
  pct_battery_trips?: number;
}

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

export interface TimePrediction {
  mode: 'subway' | 'bus';
  arrival_departure: string;
  route_id: string;
  bin: PredictionBin;
  weekly: string;
  num_accurate_predictions: number;
  num_predictions: number;
  accuracy_percentage?: string;
}

export type PredictionBin = '0-3 min' | '3-6 min' | '6-12 min' | '12-30 min';

export interface TimePredictionWeek {
  week: string;
  prediction: TimePrediction[];
  routeId: string;
}

export type DayKind = 'weekday' | 'saturday' | 'sunday';

export type ServiceLevels = {
  /** Null when the range has no day of this kind. */
  [key in DayKind]: {
    date: string;
    service_levels: number[] | undefined;
  } | null;
};

export type ScheduledService = {
  start_date: string;
  end_date: string;
  start_date_service_levels: ServiceLevels;
  end_date_service_levels: ServiceLevels;
  counts: { date: string; count: number }[];
};

export type ServiceHours = {
  date: string;
  scheduled: number;
  delivered: number;
};

export type RidershipCount = Schemas['RidershipEntry'];

/** One week of average weekday fare validations at each gated station on a line, by parent stop ID */
export type StationRidershipWeek = Schemas['StationRidershipEntry'];

/** Average weekday riders at one bus stop, in one direction and season */
export type BusStopRidershipStop = Schemas['BusStopRidershipStop'];

export type BusStopRidershipDirection = Schemas['BusStopRidershipDirection'];

/** A bus route's ridership by stop, from the MBTA's seasonal counts of every trip */
export type BusStopRidership = Schemas['BusStopRidershipResponse'];

export type ReliabilityCounts = {
  otpNumerator: number;
  otpDenominator: number;
  cancelled: number;
};

/** Headways by their ratio to the scheduled headway: ≤50%, 50–75%, 75–125% (exclusive), 125–150%, ≥150%. */
export type HeadwayCounts = {
  headways_under_50: number;
  headways_50_75: number;
  headways_75_125: number;
  headways_125_150: number;
  headways_over_150: number;
};

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
