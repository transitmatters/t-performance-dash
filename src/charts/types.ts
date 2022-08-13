export interface DataPoint {
  route_id: string;
  direction: number;
  dep_dt: Date;
  arr_dt: Date;
  current_dep_dt: Date;
  travel_time_sec: number;
  headway_time_sec: number;
  dwell_time_sec: number;
  benchmark_travel_time_sec: number;
  benchmark_headway_time_sec: number;
  threshold_flag_1?: string;
}

export interface AggregatePoint {
  '25%': number;
  '50%': number;
  '75%': number;
  count: number;
  dep_time_from_epoch: Date;
  service_date: Date;
  is_peak_day: boolean;
  max: number;
  mean: number;
  min: number;
  std: number;
}

export interface Location {
  to: string;
  from: string;
  direction: string;
  line: string;
}

export type BenchmarkField = 'benchmark_travel_time_sec' | 'benchmark_headway_time_sec' | null;

export type XField = 'dep_dt' | 'current_dep_dt' | 'arr_dt';
export type YField = 'travel_time_sec' | 'headway_time_sec' | 'dwell_time_sec';
