import type * as ReactQuery from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
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
import type { AggregateDataResponse, SingleDayDataPoint } from '../types/charts';
import { ONE_MINUTE } from '../constants/time';

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
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('network request failed');
  }
  return await response.json();
};

// Object to contain the name of each single day query and the parameters/keys it takes.
const singleDayQueryDependencies: { [key in QueryNameOptions]: SingleDayAPIParams[] } = {
  traveltimes: [SingleDayAPIParams.fromStop, SingleDayAPIParams.toStop, SingleDayAPIParams.date],
  headways: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
  dwells: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
};

// Fetch data for all aggregate charts except traveltimes.
export const fetchAggregateData = async (
  name: QueryNameKeys,
  options: PartialAggregateAPIOptions
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
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('network request failed');
  }
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
    [key in QueryNameKeys]: ReactQuery.UseQueryResult<AggregateDataResponse>;
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

  // Create multiple queries.
  const requests = useQueries({
    queries: queryTypes.map((name) => {
      return {
        queryKey: [name, queries[name].params],
        queryFn: () =>
          aggregate
            ? fetchAggregateData(name, queries[name].params)
            : fetchSingleDayData(name, queries[name].params),
        enabled,
        staleTime: ONE_MINUTE,
      };
    }),
  });

  // Return each query.
  if (routeType === 'bus') {
    return {
      [QueryNameKeys.traveltimes]: requests[0],
      [QueryNameKeys.headways]: requests[1],
    };
  }

  if (routeType === 'cr') {
    return {
      [QueryNameKeys.traveltimes]: requests[0],
      [QueryNameKeys.headways]: requests[1],
    };
  }

  return {
    [QueryNameKeys.traveltimes]: requests[0],
    [QueryNameKeys.headways]: requests[1],
    [QueryNameKeys.dwells]: requests[2],
  };
};
