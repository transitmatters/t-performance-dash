import type { UseQueryResult } from '@tanstack/react-query';
import type { TimeUnit } from 'chart.js';
import type { LineShort } from './lines';
import type { Station } from './stations';

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

export interface AggregateDataResponse {
  by_date: AggregateDataPoint[];
  by_time?: AggregateDataPoint[];
}

export interface Location {
  to: string;
  from: string;
  direction: Direction;
  line: LineShort;
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
  headwayTimeSec = 'headway_time_sec',
  dwellTimeSec = 'dwell_time_sec',
}
export enum BenchmarkFieldKeys {
  benchmarkTravelTimeSec = 'benchmark_travel_time_sec',
  benchmarkHeadwayTimeSec = 'benchmark_headway_time_sec',
}

export type PointField = PointFieldKeys;
export type MetricField = MetricFieldKeys;
export type BenchmarkField = BenchmarkFieldKeys;

type DataName = 'traveltimes' | 'headways' | 'dwells' | 'traveltimesByHour';

export interface LineProps {
  title: string;
  chartId: string;
  location: Location;
  isLoading: boolean;
  pointField: PointField; // X value
  bothStops?: boolean;
  fname: DataName;
  homescreen?: boolean;
  showLegend?: boolean;
}

export interface AggregateLineProps extends LineProps {
  timeUnit: TimeUnit;
  data: AggregateDataPoint[];
  timeFormat: string;
  seriesName: string;
  fillColor: string;
  startDate: string | undefined;
  endDate: string | undefined;
  suggestedYMin?: number;
  suggestedYMax?: number;
  children?: React.ReactNode;
}

export interface SingleDayLineProps extends LineProps {
  data: SingleDayDataPoint[];
  metricField: MetricField;
  date: string | undefined;
  benchmarkField?: BenchmarkField;
}

export interface HeadwayHistogramProps {
  title: string;
  chartId: string;
  data: SingleDayDataPoint[];
  date: string | undefined;
  location: Location;
  isLoading: boolean;
  bothStops?: boolean;
  fname: DataName;
  showLegend?: boolean;
  metricField: MetricField;
}

export interface HeadwaysChartProps {
  headways: UseQueryResult<SingleDayDataPoint[]>;
  fromStation: Station | undefined;
  toStation: Station | undefined;
  showLegend?: boolean;
  homescreen?: boolean;
}
