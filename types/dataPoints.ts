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
