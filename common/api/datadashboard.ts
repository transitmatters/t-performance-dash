import type * as ReactQuery from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { QUERIES, AggregateAPIParams, QueryNameKeys, SingleDayAPIParams } from '../types/api';
import type {
  AggregateAPIOptions,
  PartialAggregateAPIOptions,
  PartialSingleDayAPIOptions,
  QueryNameOptions,
  RouteType,
  SingleDayAPIOptions,
} from '../types/api';
import { APP_DATA_BASE_PATH } from '../utils/constants';
import { getCurrentDate } from '../utils/date';
import type {
  AggregateDataResponse,
  ChunkedAggregateQueryResult,
  SingleDayDataPoint,
} from '../types/charts';
import { ONE_MINUTE } from '../constants/time';
import { hasReliableCommuterRailBenchmarks } from '../constants/dates';
import type { DateChunk } from '../utils/dateChunks';
import { splitDateRange } from '../utils/dateChunks';
import { fetchOrThrow } from './utils/ApiError';

// Fetch data for all single day charts.
export const fetchSingleDayData = async (
  name: QueryNameKeys,
  options: PartialSingleDayAPIOptions
): Promise<SingleDayDataPoint[]> => {
  const date = options.date ?? getCurrentDate();
  const url = new URL(`${APP_DATA_BASE_PATH}/api/${name}/${date}`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
    // options includes date which is a string. Date is never used as a parameter since it is part of the URL, so it can be excluded.
    if (!(typeof value === 'string') && key !== 'date')
      value.forEach((subvalue) => url.searchParams.append(key, subvalue));
  });
  const response = await fetchOrThrow(url.toString(), undefined, `Failed to fetch ${name}`);
  return await response.json();
};

// Drops a day's benchmarks so charts and widgets treat it as having none
const withoutBenchmarks = (data: SingleDayDataPoint[]): SingleDayDataPoint[] =>
  data.map((point) => ({
    ...point,
    benchmark_travel_time_sec: undefined,
    benchmark_headway_time_sec: null,
  }));

// Object to contain the name of each single day query and the parameters/keys it takes.
const singleDayQueryDependencies: { [key in QueryNameOptions]: SingleDayAPIParams[] } = {
  traveltimes: [SingleDayAPIParams.fromStop, SingleDayAPIParams.toStop, SingleDayAPIParams.date],
  headways: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
  dwells: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
};

// Fetch data for all aggregate charts except traveltimes.
export const fetchAggregateData = async (
  name: QueryNameKeys,
  options: PartialAggregateAPIOptions,
  signal?: AbortSignal
): Promise<AggregateDataResponse> => {
  const method = name === QueryNameKeys.traveltimes ? 'traveltimes2' : name;

  const url = new URL(`${APP_DATA_BASE_PATH}/api/aggregate/${method}`, window.location.origin);
  // Loop through each option and append values to searchParams.
  Object.entries(options).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((subvalue) => url.searchParams.append(key, subvalue));
    } else {
      url.searchParams.append(key, value.toString());
    }
  });
  const response = await fetchOrThrow(
    url.toString(),
    { signal },
    `Failed to fetch aggregate ${method}`
  );
  const responseJson = await response.json();
  return name === QueryNameKeys.traveltimes ? responseJson : { by_date: responseJson, by_time: [] };
};

// Object to contain name of each aggregate query and the parameters/keys it takes.
const aggregateQueryDependencies: { [key in QueryNameKeys]: AggregateAPIParams[] } = {
  traveltimes: [
    AggregateAPIParams.fromStop,
    AggregateAPIParams.toStop,
    AggregateAPIParams.startDate,
    AggregateAPIParams.endDate,
  ],
  headways: [AggregateAPIParams.stop, AggregateAPIParams.startDate, AggregateAPIParams.endDate],
  dwells: [AggregateAPIParams.stop, AggregateAPIParams.startDate, AggregateAPIParams.endDate],
};

// Combines one query's date-range chunks (newest first) into a single result. The chart renders as
// soon as any chunk has rows; it only errors once nothing is pending and no rows came back.
const mergeChunks = (
  results: ReactQuery.UseQueryResult<AggregateDataResponse>[],
  chunks: DateChunk[]
): ChunkedAggregateQueryResult => {
  const [newest] = results;
  if (results.length === 1) return newest;

  const loaded = results.filter((result) => result.data);
  const failed = results.filter((result) => result.isError);
  const pending = results.filter((result) => !result.data && !result.isError);
  const merged = {
    // Oldest chunk first keeps by_date in date order within each peak bucket.
    by_date: [...results].reverse().flatMap((result) => result.data?.by_date ?? []),
    by_time: newest.data?.by_time ?? [],
  };
  // Hold off on an empty result until the remaining chunks could still fill it.
  const data =
    loaded.length && (merged.by_date.length || (!pending.length && !failed.length))
      ? merged
      : undefined;
  const isError = !data && !pending.length;
  const isFetching = results.some((result) => result.isFetching);

  return {
    ...newest,
    data,
    error: isError ? failed[0].error : null,
    isError,
    isPending: !data && !isError,
    isLoading: !data && !isError && isFetching,
    isSuccess: Boolean(data),
    status: data ? 'success' : isError ? 'error' : 'pending',
    isFetching,
    refetch: () =>
      Promise.all((failed.length ? failed : results).map((result) => result.refetch())).then(
        () => newest
      ),
    chunks: {
      total: results.length,
      loaded: loaded.length,
      failed: failed.length,
      pending: pending.length,
      byTimeRange: chunks[0],
      byTimeStatus: newest.data ? 'success' : newest.isError ? 'error' : 'pending',
    },
  } as ChunkedAggregateQueryResult;
};

// Overload call to specify type for single day queries
type UseQueriesOverload = {
  (
    routeType: RouteType,
    parameters: SingleDayAPIOptions,
    aggregate: false,
    enabled?: boolean
  ): {
    [key in QueryNameKeys]: ReactQuery.UseQueryResult<SingleDayDataPoint[]>;
  };
  (
    routeType: RouteType,
    parameters: AggregateAPIOptions,
    aggregate: true,
    enabled?: boolean
  ): {
    [key in QueryNameKeys]: ChunkedAggregateQueryResult;
  };
};

// Return type `any` because the return type is specified in the overload in `UseQueriesOverload`
export const useTripExplorerQueries: UseQueriesOverload = (
  routeType: RouteType,
  parameters: SingleDayAPIOptions | AggregateAPIOptions,
  aggregate: boolean,
  enabled = true
): any => {
  const queryTypes = QUERIES[routeType];
  const dependencies = aggregate ? aggregateQueryDependencies : singleDayQueryDependencies;
  // Create objects with keys of query names which contains keys and parameters.
  const queries = {};
  queryTypes.forEach((queryName) => {
    const keys = [queryName];
    const params: Partial<SingleDayAPIOptions | AggregateAPIOptions> = {};
    dependencies[queryName].forEach((field: Partial<AggregateAPIParams | SingleDayAPIParams>) => {
      if (parameters[field]) {
        keys.push(parameters[field].toString());
        params[field] = parameters[field];
      }
      queries[queryName] = { keys: keys, params: params };
    });
  });

  const date = 'date' in parameters ? parameters.date : undefined;
  const hideBenchmarks =
    routeType === 'cr' &&
    !aggregate &&
    typeof date === 'string' &&
    !hasReliableCommuterRailBenchmarks(date);

  // Long aggregate ranges are fetched as several smaller requests so each one finishes in time.
  const startDate = 'start_date' in parameters ? parameters.start_date : undefined;
  const endDate = 'end_date' in parameters ? parameters.end_date : undefined;
  const chunks = useMemo(
    () =>
      aggregate && typeof startDate === 'string' && typeof endDate === 'string'
        ? splitDateRange(startDate, endDate)
        : [],
    [aggregate, startDate, endDate]
  );
  const chunkCount = Math.max(chunks.length, 1);

  const combine = useCallback(
    (results: ReactQuery.UseQueryResult[]) =>
      Object.fromEntries(
        queryTypes.map((name, i) => {
          const queryResults = results.slice(i * chunkCount, (i + 1) * chunkCount);
          return [
            name,
            aggregate
              ? mergeChunks(
                  queryResults as ReactQuery.UseQueryResult<AggregateDataResponse>[],
                  chunks
                )
              : queryResults[0],
          ];
        })
      ),
    [queryTypes, chunkCount, aggregate, chunks]
  );

  // Create one query per name and chunk, grouped back by name in `combine`.
  return useQueries({
    queries: queryTypes.flatMap((name) => {
      const chunkParams = chunks.length
        ? chunks.map((chunk) => ({
            ...queries[name].params,
            start_date: chunk.startDate,
            end_date: chunk.endDate,
          }))
        : [queries[name].params];
      return chunkParams.map((params) => ({
        queryKey: [name, params],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          aggregate ? fetchAggregateData(name, params, signal) : fetchSingleDayData(name, params),
        select: hideBenchmarks ? withoutBenchmarks : undefined,
        enabled,
        staleTime: ONE_MINUTE,
      }));
    }),
    combine,
  });
};
