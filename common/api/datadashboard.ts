import * as ReactQuery from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
import { AggregateDataResponse, SingleDayDataPoint } from '../../src/charts/types';
import {
  AggregateAPIParams,
  AggregateAPIOptions,
  PartialAggregateAPIOptions,
  PartialSingleDayAPIOptions,
  QueryNameKeys,
  SingleDayAPIParams,
  SingleDayAPIOptions,
} from '../types/api';
import { APP_DATA_BASE_PATH } from '../../utils/constants';

// Fetch data for all single day charts.
export const fetchSingleDayData = (
  name: QueryNameKeys,
  options: PartialSingleDayAPIOptions
): Promise<SingleDayDataPoint[]> => {
  // TODO: Remove `api/` from URL. Temporary fix to work with rewrites in development
  const url = new URL(`api/${name}/${options.date}`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
    // options includes date which is a string. Date is never used as a parameter since it is part of the URL, so it can be excluded.
    if (!(typeof value === 'string') && key !== 'date')
      value.forEach((subvalue) => url.searchParams.append(key, subvalue));
  });
  return fetch(url.toString()).then((resp) => resp.json());
};

// Object to contain the name of each single day query and the parameters/keys it takes.
const singleDayQueryDependencies = {
  traveltimes: [SingleDayAPIParams.fromStop, SingleDayAPIParams.toStop, SingleDayAPIParams.date],
  headways: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
  dwells: [SingleDayAPIParams.stop, SingleDayAPIParams.date],
};

// Fetch data for all aggregate charts except traveltimes.
export const fetchAggregateData = (
  name: QueryNameKeys,
  options: PartialAggregateAPIOptions
): Promise<AggregateDataResponse> => {
  const method = name === QueryNameKeys.traveltimes ? 'traveltimes2' : name;

  // TODO: Remove `api/` from URL. Temporary fix to work with rewrites in development
  const url = new URL(`api/${APP_DATA_BASE_PATH}/aggregate/${method}`, window.location.origin);
  // Loop through each option and append values to searchParams.
  Object.entries(options).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((subvalue) => url.searchParams.append(key, subvalue));
    } else {
      url.searchParams.append(key, value.toString());
    }
  });
  return fetch(url.toString())
    .then((resp) => resp.json())
    .then((resp) => {
      // traveltimes API returns data under two fields: by_date and by_time. This formats the other two APIs to be the same shape.
      return name === QueryNameKeys.traveltimes ? resp : { by_date: resp };
    });
};

// Object to contain name of each aggregate query and the parameters/keys it takes.
const aggregateQueryDependencies = {
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
  (parameters: SingleDayAPIOptions, aggregate: false, enabled: boolean): {
    [key in QueryNameKeys]: ReactQuery.UseQueryResult<SingleDayDataPoint[]>;
  };
  (parameters: AggregateAPIOptions, aggregate: true, enabled: boolean): {
    [key in QueryNameKeys]: ReactQuery.UseQueryResult<AggregateDataResponse>;
  };
};

// Return type `any` because the return type is specified in the overload in `UseQueriesOverload`
export const useCustomQueries: UseQueriesOverload = (
  parameters: SingleDayAPIOptions | AggregateAPIOptions,
  aggregate: boolean,
  enabled = true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const dependencies = aggregate ? aggregateQueryDependencies : singleDayQueryDependencies;
  // Create objects with keys of query names which contains keys and parameters.
  const queries = Object.keys(dependencies).reduce((object, queryName: QueryNameKeys) => {
    const keys = [queryName];
    const params = {};
    dependencies[queryName].forEach((field: AggregateAPIParams | SingleDayAPIParams) => {
      keys.push(parameters[field].toString());
      params[field] = parameters[field];
    });
    return {
      ...object,
      [queryName]: { keys: keys, params: params },
    };
  }, {});

  // Create multiple queries.
  const requests = useQueries({
    queries: Object.keys(queries).map((name: QueryNameKeys) => {
      return {
        queryKey: queries[name].keys,
        queryFn: () =>
          aggregate
            ? fetchAggregateData(name, queries[name].params)
            : fetchSingleDayData(name, queries[name].params),
        enabled,
      };
    }),
  });

  // Return each query.
  return {
    [QueryNameKeys.traveltimes]: requests[0],
    [QueryNameKeys.headways]: requests[1],
    [QueryNameKeys.dwells]: requests[2],
  };
};
