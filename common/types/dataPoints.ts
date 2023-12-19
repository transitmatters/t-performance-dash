import type { Line, LineShort } from './lines';
import type { Station } from './stations';

export interface DataPoint {
  route_id: string;
  direction: number;
}

export interface TravelTimePoint extends DataPoint {
  dep_dt: string;
  arr_dt: string;
  travel_time_sec: number;
  benchmark_travel_time_sec: number;
  threshold_flag_1?: string;
  threshold_flag_2?: string;
  threshold_flag_3?: string;
}

export interface HeadwayPoint extends DataPoint {
  prev_route_id: string;
  current_dep_dt: string;
  previous_dep_dt: string;
  headway_time_sec: number;
  benchmark_headway_time_sec: number;
  threshold_flag_1?: string;
  threshold_flag_2?: string;
  threshold_flag_3?: string;
}

export interface DwellPoint extends DataPoint {
  arr_dt: string;
  dep_dt: string;
  dwell_time_sec: number;
}

export interface DayDelayTotals {
  date: string;
  Blue: number;
  Orange: number;
  Red: number;
  Green: number;
}

export type Direction = 'northbound' | 'southbound';

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

export interface SpeedDataPoint {
  count: number;
  date: string;
  line: Line;
  value: number;
}

export interface DeliveredTripMetrics {
  line: Line;
  date: string;
  miles_covered: number;
  total_time: number;
  count: number;
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

export type SpeedRestriction = {
  id: string;
  line: Exclude<LineShort, 'Bus'>;
  description: string;
  reason: string;
  fromStopId: null | string;
  toStopId: null | string;
  reported: string;
  speedMph: number;
  trackFeet: number;
  lineId: Line;
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
}

export type PredictionBin = '0-3 min' | '3-6 min' | '6-12 min' | '12-30 min';

export interface TimePredictionWeek {
  week: string;
  prediction: TimePrediction[];
  routeId: string;
}

export type DayKind = 'weekday' | 'saturday' | 'sunday';

export type ServiceLevels = {
  [key in DayKind]: {
    date: string;
    service_levels: number[] | undefined;
  };
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

export type RidershipCount = {
  date: string;
  count: number;
};
