export type DataPoints = TravelTimePoint[] | HeadwayPoint[] | DwellPoint[];

export interface TravelTimePoint {
  route_id: string;
  direction: number;
  dep_dt: string;
  arr_dt: string;
  travel_time_sec: number;
  benchmark_travel_time_sec: number;
  threshold_flag_1?: string;
  threshold_flag_2?: string;
  threshold_flag_3?: string;
}

export interface HeadwayPoint {
  route_id: string;
  prev_route_id: string;
  direction: number;
  current_dep_dt: string;
  previous_dep_dt: string;
  headway_time_sec: number;
  benchmark_headway_time_sec: number;
  threshold_flag_1?: string;
  threshold_flag_2?: string;
  threshold_flag_3?: string;
}

export interface DwellPoint {
  route_id: string;
  direction: number;
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
  color: string;
  fr_id: string;
  to_id: string;
};
