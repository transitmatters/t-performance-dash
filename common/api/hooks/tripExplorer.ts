/**
 * The trip explorer's data: travel times, headways and dwells for a trip between two stops.
 *
 * - `useSingleDayTripMetrics` fetches one day: one request per metric.
 * - `useMultiDayTripMetrics` fetches a date range. Long ranges go out as several shorter requests
 *   so each finishes in time, and each metric's pieces are merged back into one result.
 */
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
import { pickBy } from '@lodash-utils';
import { QUERIES } from '../../types/api';
import type {
  AggregateAPIOptions,
  PartialAggregateAPIOptions,
  PartialSingleDayAPIOptions,
  QueryNameKeys,
  RouteType,
  SingleDayAPIOptions,
} from '../../types/api';
import type { ChunkedAggregateQueryResult, SingleDayDataPoint } from '../../types/charts';
import { ONE_MINUTE } from '../../constants/time';
import { hasReliableCommuterRailBenchmarks } from '../../constants/dates';
import { splitDateRange } from '../../utils/dateChunks';
import { fetchAggregateData, fetchSingleDayData } from '../datadashboard';
import { mergeChunks } from '../utils/mergeChunks';

type TripMetric = QueryNameKeys;

/** The stops each metric is measured at: travel times between two, the others at one. */
const STOP_PARAMS: Record<TripMetric, string[]> = {
  traveltimes: ['from_stop', 'to_stop'],
  headways: ['stop'],
  dwells: ['stop'],
};

/** Just the params a metric's request takes, so its cache key doesn't change with the others'. */
const paramsFor = <T extends object>(params: T, metric: TripMetric, dateKeys: string[]) =>
  pickBy<T>(
    params,
    (value, key) => Boolean(value) && [...STOP_PARAMS[metric], ...dateKeys].includes(key)
  );

/** One day of one metric. Shared with the home page's hero chart, which shows the same data. */
export const singleDayTripMetricQuery = (
  metric: TripMetric,
  params: PartialSingleDayAPIOptions
) => ({
  queryKey: ['tripMetric', metric, params] as const,
  queryFn: () => fetchSingleDayData(metric, params),
  staleTime: ONE_MINUTE,
});

const multiDayTripMetricQuery = (metric: TripMetric, params: PartialAggregateAPIOptions) => ({
  queryKey: ['tripMetric', metric, 'aggregate', params] as const,
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchAggregateData(metric, params, signal),
  staleTime: ONE_MINUTE,
});

/** Commuter Rail's schedule benchmarks are unreliable on some days; charts then show none. */
const withoutBenchmarks = (data: SingleDayDataPoint[]): SingleDayDataPoint[] =>
  data.map((point) => ({
    ...point,
    benchmark_travel_time_sec: undefined,
    benchmark_headway_time_sec: null,
  }));

interface TripMetricsOptions<Params> {
  routeType: RouteType;
  params: Params;
  enabled?: boolean;
  /** Fetch only these metrics, as an embed does for its one chart. Defaults to all the mode has. */
  only?: TripMetric[];
  /** Metrics the page won't show, so they aren't fetched. */
  skip?: TripMetric[];
}

export type SingleDayTripMetrics = Record<TripMetric, UseQueryResult<SingleDayDataPoint[]>>;
export type MultiDayTripMetrics = Record<TripMetric, ChunkedAggregateQueryResult>;

export const useSingleDayTripMetrics = ({
  routeType,
  params,
  enabled = true,
  only,
  skip = [],
}: TripMetricsOptions<SingleDayAPIOptions>): SingleDayTripMetrics => {
  const metrics = only ?? QUERIES[routeType];
  const { date } = params;
  const hideBenchmarks =
    routeType === 'cr' && typeof date === 'string' && !hasReliableCommuterRailBenchmarks(date);

  return useQueries({
    queries: metrics.map((metric) => ({
      ...singleDayTripMetricQuery(metric, paramsFor(params, metric, ['date'])),
      select: hideBenchmarks ? withoutBenchmarks : undefined,
      enabled: enabled && !skip.includes(metric),
    })),
    combine: (results) =>
      Object.fromEntries(metrics.map((metric, i) => [metric, results[i]])) as SingleDayTripMetrics,
  });
};

export const useMultiDayTripMetrics = ({
  routeType,
  params,
  enabled = true,
  only,
  skip = [],
}: TripMetricsOptions<AggregateAPIOptions>): MultiDayTripMetrics => {
  const metrics = only ?? QUERIES[routeType];
  const { start_date: startDate, end_date: endDate } = params;
  // Newest first. A short range is a single chunk; with no dates yet there are none.
  const chunks =
    typeof startDate === 'string' && typeof endDate === 'string'
      ? splitDateRange(startDate, endDate)
      : [];
  const chunksPerMetric = Math.max(chunks.length, 1);

  // Every metric's chunks in one list, metric by metric, so `combine` can slice them back apart.
  const queries = metrics.flatMap((metric) => {
    const metricParams = paramsFor(params, metric, ['start_date', 'end_date']);
    const requests = chunks.length
      ? chunks.map((chunk) => ({
          ...metricParams,
          start_date: chunk.startDate,
          end_date: chunk.endDate,
        }))
      : [metricParams];
    return requests.map((requestParams) => ({
      ...multiDayTripMetricQuery(metric, requestParams),
      enabled: enabled && !skip.includes(metric),
    }));
  });

  return useQueries({
    queries,
    combine: (results) =>
      Object.fromEntries(
        metrics.map((metric, i) => [
          metric,
          mergeChunks(results.slice(i * chunksPerMetric, (i + 1) * chunksPerMetric), chunks),
        ])
      ) as MultiDayTripMetrics,
  });
};
