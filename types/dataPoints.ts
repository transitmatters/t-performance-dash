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
