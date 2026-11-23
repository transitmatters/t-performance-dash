import type { UseQueryResult } from '@tanstack/react-query';
import { queryOptions, skipToken, useQueries } from '@tanstack/react-query';
import { QUERIES, QueryNameKeys } from '../../types/api';
import type { RouteType } from '../../types/api';
import type { ChunkedAggregateQueryResult, SingleDayDataPoint } from '../../types/charts';
import { ONE_MINUTE } from '../../constants/time';
import { hasReliableCommuterRailBenchmarks } from '../../constants/dates';
import type { DateChunk } from '../../utils/dateChunks';
import { splitDateRange } from '../../utils/dateChunks';
import { fetchAggregateData, fetchSingleDayData } from '../datadashboard';
import { mergeChunks } from '../utils/mergeChunks';

type TripMetric = QueryNameKeys;

interface TripStops {
  stop: string[];
  from_stop: string[];
  to_stop: string[];
}

export type SingleDayTripParams = TripStops & { date: string };
export type MultiDayTripParams = TripStops & { start_date: string; end_date: string };

type MetricStops = Pick<TripStops, 'stop'> | Pick<TripStops, 'from_stop' | 'to_stop'>;

const stopsFor = (stops: TripStops, metric: TripMetric): MetricStops =>
  metric === QueryNameKeys.traveltimes
    ? { from_stop: stops.from_stop, to_stop: stops.to_stop }
    : { stop: stops.stop };

type SingleDayRequest = Partial<TripStops> & { date: string };
type MultiDayRequest = MetricStops & { start_date: string; end_date: string };

// Shared with the home page's hero chart. An undefined request fetches nothing.
export const singleDayTripMetricQuery = (metric: TripMetric, request?: SingleDayRequest) =>
  queryOptions({
    queryKey: ['tripMetric', metric, request ?? null],
    queryFn: request ? () => fetchSingleDayData(metric, request) : skipToken,
    staleTime: ONE_MINUTE,
  });

const multiDayTripMetricQuery = (metric: TripMetric, request?: MultiDayRequest) =>
  queryOptions({
    queryKey: ['tripMetric', metric, 'aggregate', request ?? null],
    queryFn: request ? ({ signal }) => fetchAggregateData(metric, request, signal) : skipToken,
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
  /** Nothing is fetched while this is undefined. */
  params: Params | undefined;
  /** Defaults to every metric the mode has. */
  only?: TripMetric[];
  skip?: TripMetric[];
}

const wantedMetrics = (routeType: RouteType, only?: TripMetric[], skip: TripMetric[] = []) =>
  (only ?? QUERIES[routeType]).filter((metric) => !skip.includes(metric));

export interface SingleDayTripMetrics {
  traveltimes: UseQueryResult<SingleDayDataPoint[]>;
  headways: UseQueryResult<SingleDayDataPoint[]>;
  dwells: UseQueryResult<SingleDayDataPoint[]>;
}

export interface MultiDayTripMetrics {
  traveltimes: ChunkedAggregateQueryResult;
  headways: ChunkedAggregateQueryResult;
  dwells: ChunkedAggregateQueryResult;
}

export const useSingleDayTripMetrics = ({
  routeType,
  params,
  only,
  skip,
}: TripMetricsOptions<SingleDayTripParams>): SingleDayTripMetrics => {
  const wanted = wantedMetrics(routeType, only, skip);
  const hideBenchmarks =
    routeType === 'cr' && params !== undefined && !hasReliableCommuterRailBenchmarks(params.date);

  const query = (metric: TripMetric) => ({
    ...singleDayTripMetricQuery(
      metric,
      params && wanted.includes(metric)
        ? { ...stopsFor(params, metric), date: params.date }
        : undefined
    ),
    select: hideBenchmarks ? withoutBenchmarks : undefined,
  });

  const [traveltimes, headways, dwells] = useQueries({
    queries: [
      query(QueryNameKeys.traveltimes),
      query(QueryNameKeys.headways),
      query(QueryNameKeys.dwells),
    ],
  });
  return { traveltimes, headways, dwells };
};

export const useMultiDayTripMetrics = ({
  routeType,
  params,
  only,
  skip,
}: TripMetricsOptions<MultiDayTripParams>): MultiDayTripMetrics => {
  const wanted = wantedMetrics(routeType, only, skip);
  // Long ranges are split so each request finishes before API Gateway's timeout.
  const chunks: DateChunk[] = params ? splitDateRange(params.start_date, params.end_date) : [];

  const queries = (metric: TripMetric) => {
    if (!params || !wanted.includes(metric)) return [multiDayTripMetricQuery(metric)];
    const stops = stopsFor(params, metric);
    return chunks.map((chunk) =>
      multiDayTripMetricQuery(metric, {
        ...stops,
        start_date: chunk.startDate,
        end_date: chunk.endDate,
      })
    );
  };

  const traveltimes = queries(QueryNameKeys.traveltimes);
  const headways = queries(QueryNameKeys.headways);
  const dwells = queries(QueryNameKeys.dwells);
  const headwaysStart = traveltimes.length;
  const dwellsStart = headwaysStart + headways.length;

  return useQueries({
    queries: [...traveltimes, ...headways, ...dwells],
    combine: (results) => ({
      traveltimes: mergeChunks(results.slice(0, headwaysStart), chunks),
      headways: mergeChunks(results.slice(headwaysStart, dwellsStart), chunks),
      dwells: mergeChunks(results.slice(dwellsStart), chunks),
    }),
  });
};
