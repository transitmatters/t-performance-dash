import type { UseQueryResult } from '@tanstack/react-query';
import type { TimeUnit } from 'chart.js';
import type { HoverCardRow } from '../components/charts/hoverCard/types';
import type { TripEmbedChart } from '../constants/staticRoutes';
import type { Schemas } from './apiSchemas';
import type { AlertsScope } from './alerts';
import type { LineShort } from './lines';
import type { Station } from './stations';

/** A headway, dwell or travel time event, with the fields any of those charts reads. */
export interface SingleDayDataPoint {
  route_id: string;
  /** Headway events send it as a string ('0', '1'), dwells and travel times as a number. */
  direction: number | string;
  dep_dt?: string;
  arr_dt?: string;
  current_dep_dt?: string;
  travel_time_sec?: number;
  headway_time_sec?: number;
  dwell_time_sec?: number;
  benchmark_travel_time_sec?: number | null;
  benchmark_headway_time_sec?: number | null;
  tm_benchmark_travel_time_sec?: number | null;
  threshold_flag_1?: string;
  speed_mph?: number;
  benchmark_speed_mph?: number;
  vehicle_consist?: string | null;
  occupancy_status?: string | null;
  occupancy_percentage?: string | null;
  vehicle_label?: string;
}

/**
 * One point of an aggregate trip chart: a day (`service_date`) or a time of day
 * (`dep_time_from_epoch`), with the fields of the spec's aggregate schemas that the charts read.
 * Headway days add `bunched`, `on_time` and `scheduled`; a speed chart's points have no `std`.
 */
export type AggregateDataPoint = Pick<
  Schemas['AggregateByDate'],
  'count' | 'mean' | 'min' | 'max' | '25%' | '50%' | '75%'
> &
  Partial<
    Pick<
      Schemas['HeadwayAggregateByDate'],
      'std' | 'service_date' | 'peak' | 'holiday' | 'weekend' | 'bunched' | 'on_time' | 'scheduled'
    >
  > &
  Partial<Pick<Schemas['AggregateByTime'], 'dep_time_from_epoch' | 'is_peak_day'>>;

export interface AggregateDataResponse {
  by_date: AggregateDataPoint[];
  by_time: AggregateDataPoint[];
}

export interface AggregateChunkProgress {
  total: number;
  loaded: number;
  failed: number;
  /** Chunks with neither data nor an error yet. */
  pending: number;
  /** The date spans those pending chunks cover, joined where they touch, oldest first. */
  pendingRanges: { startDate: string; endDate: string }[];
  /** by_time is taken from the newest chunk only, since percentiles can't be merged across chunks. */
  byTimeRange: { startDate: string; endDate: string };
  byTimeStatus: 'pending' | 'error' | 'success';
}

/** An aggregate query fetched as several date-range chunks; `chunks` is set when there are 2+. */
export type ChunkedAggregateQueryResult = UseQueryResult<AggregateDataResponse> & {
  chunks?: AggregateChunkProgress;
};

export interface Location {
  to: string;
  from: string;
  direction: Direction;
}

export type TravelTimesUnit = 'by_date' | 'by_time';

export type DayFilter = 'all' | 'weekday' | 'weekend';

export const DIRECTIONS = [
  'northbound',
  'southbound',
  'eastbound',
  'westbound',
  'inbound',
  'outbound',
  'loop',
] as const;

type Direction = (typeof DIRECTIONS)[number];

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
  speedMph = 'speed_mph',
}
export enum BenchmarkFieldKeys {
  benchmarkTravelTimeSec = 'benchmark_travel_time_sec',
  benchmarkHeadwayTimeSec = 'benchmark_headway_time_sec',
  benchmarkSpeedMph = 'benchmark_speed_mph',
  tmBenchmarkTravelTimeSec = 'tm_benchmark_travel_time_sec',
}

export type PointField = PointFieldKeys;
export type AggregatePointField = PointFieldKeys.serviceDate | PointFieldKeys.depTimeFromEpoch;
export type SingleDayPointField = Exclude<PointField, AggregatePointField>;
export type MetricField = MetricFieldKeys;
export type BenchmarkField = BenchmarkFieldKeys;

type DataName = 'traveltimes' | 'headways' | 'dwells' | 'traveltimesByHour' | 'speeds';

export interface LineProps {
  chartId: string;
  location: Location;
  pointField: PointField; // X value
  includeBothStopsForLocation?: boolean;
  fname: DataName;
  showLegend?: boolean;
  chartTitle?: string;
  /** Show ratios under 1.00 differently in chart */
  showUnderRatio?: boolean;
}

/** A subway trip whose slow zones go in a chart's context track. */
export interface SlowZonesTrip {
  fromStation: Station;
  toStation: Station;
  lineShort: LineShort;
  color: string;
}

export interface AggregateLineProps extends LineProps {
  pointField: AggregatePointField;
  timeUnit: TimeUnit;
  data: AggregateDataPoint[];
  timeFormat: string;
  seriesName: string;
  fillColor: string;
  startDate: string;
  endDate: string;
  suggestedYMin?: number;
  suggestedYMax?: number;
  byTime?: boolean;
  children?: React.ReactNode;
  yUnit: string;
  /** Extra rows for a day's hover card, after the percentiles. */
  hoverRows?: (point: AggregateDataPoint) => HoverCardRow[];
  /** Fill the parent's height and leave out the legend and buttons under the chart, as an embed does. */
  fill?: boolean;
  /** Adds an Embed button that copies an `<iframe>` of this multi-day trip chart. */
  embedChart?: TripEmbedChart<'multi'>;
  /** Start with the trendline drawn. */
  trendline?: boolean;
  slowZonesTrip?: SlowZonesTrip;
  /** Set when the range loads in chunks: the spans still loading, shaded until they arrive. */
  loadingRanges?: { startDate: string; endDate: string }[];
}

export interface SingleDayLineProps extends LineProps {
  pointField: SingleDayPointField;
  data: SingleDayDataPoint[];
  metricField: MetricField;
  date: string;
  benchmarkField?: BenchmarkField;
  tmBenchmarkField?: BenchmarkField;
  units: 'Minutes' | 'MPH';
  /** Fill the parent's height and leave out the toggles and buttons under the chart, as an embed does. */
  fill?: boolean;
  /** Adds an Embed button that copies an `<iframe>` of this trip chart. */
  embedChart?: TripEmbedChart<'single'>;
  /** Rings one point and labels it, e.g. the day's longest wait. */
  callout?: ChartCallout;
  /** The download, image and embed buttons, which name the page's line and stops. Off where the
   * chart isn't on a line's page. */
  actions?: boolean;
  /** Draws the series in, point by point, the first time the chart appears. */
  intro?: boolean;
  /** Whose alerts the context track shows. */
  alerts: AlertsScope;
}

export interface ChartCallout {
  /** Index into `data`. */
  index: number;
  label: string;
}

export interface HeadwaysChartProps {
  headways: SingleDayDataPoint[];
  fromStation: Station;
  toStation: Station;
  showLegend?: boolean;
  date: string;
  /** Fill the parent's height and leave out the buttons under the chart, as an embed does. */
  fill?: boolean;
  callout?: ChartCallout;
  /** Off where the chart isn't on a line's page; see SingleDayLineProps. */
  actions?: boolean;
  intro?: boolean;
}
