import type { Line, LineShort } from './lines';

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
  color: string;
  fr_id: string;
  to_id: string;
  from: string;
  to: string;
  id: string;
  direction: Direction;
  order: number;
}

export type SlowZoneResponse = {
  start: string;
  end: string;
  mean_metric: number;
  duration: number;
  baseline: number;
  delay: number;
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
