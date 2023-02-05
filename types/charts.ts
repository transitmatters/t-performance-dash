export interface SingleDayDataPoint {
  route_id: string;
  direction: number;
  dep_dt?: string;
  arr_dt?: string;
  current_dep_dt?: string;
  travel_time_sec?: number;
  headway_time_sec?: number;
  dwell_time_sec?: number;
  benchmark_travel_time_sec?: number;
  benchmark_headway_time_sec?: number;
  threshold_flag_1?: string;
}

export interface AggregateDataPoint {
  '25%': number;
  '50%': number;
  '75%': number;
  count: number;
  max: number;
  mean: number;
  min: number;
  std: number;
  service_date?: string;
  dep_time_from_epoch?: string;
  is_peak_day?: boolean;
  peak?: string;
}

export interface Location {
  to: string;
  from: string;
  direction: Direction;
  line: string;
}

type Direction = 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'inbound' | 'outbound';

export enum PointFieldKeys {
  depDt = 'dep_dt',
  currentDepDt = 'current_dep_dt',
  arrDt = 'arr_dt',
  serviceDate = 'service_date',
  depTimeFromEpoch = 'dep_time_from_epoch',
}

export enum MetricFieldKeys {
  travelTimeSec = 'travel_time_sec',
  headWayTimeSec = 'headway_time_sec',
  dwellTimeSec = 'dwell_time_sec',
}
export enum BenchmarkFieldKeys {
  benchmarkTravelTimeSec = 'benchmark_travel_time_sec',
  benchmarkHeadwayTimeSec = 'benchmark_headway_time_sec',
}

export type PointField = PointFieldKeys;
export type MetricField = MetricFieldKeys;
export type BenchmarkField = BenchmarkFieldKeys;
