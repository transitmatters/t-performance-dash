import { useQuery } from '@tanstack/react-query';
import { AggregateDataPoint, SingleDayDataPoint, TravelTimesRequest } from '../src/charts/types';
import { AggregateAPIOptions, QueryNameOptions, SingleDayAPIOptions } from '../types/api';
import { APP_DATA_BASE_PATH } from '../utils/constants';

// Date isn't really optional. If date is not set this query will be disabled.
// Just setting it as optional because dashboard loads this before user input.
export const fetchSingleDayData = (
  name: string,
  options: SingleDayAPIOptions,
  date?: string | null
): Promise<SingleDayDataPoint[]> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/${name}/${date}`, window.location.origin);

  Object.entries(options).forEach(([key, value]) => {
    value?.forEach((subvalue) => url.searchParams.append(key, subvalue));
  });
  return fetch(url).then((resp) => resp.json());
};

export const useQuerySingleDayData = (
  params: SingleDayAPIOptions,
  name: QueryNameOptions,
  queryReady: boolean,
  date?: string
) => {
  const queryKeys = [name, date];
  Object.entries(params).forEach(([, value]) => queryKeys.push(value?.toString()));
  return useQuery({
    enabled: queryReady,
    queryKey: queryKeys,
    queryFn: () => fetchSingleDayData(name, params, date),
  });
};

export const fetchAggregateData = (
  name: string,
  options: AggregateAPIOptions
): Promise<AggregateDataPoint[]> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/aggregate/${name}`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value?.forEach((subvalue) => url.searchParams.append(key, subvalue));
    } else {
      url.searchParams.append(key, value?.toString() || '');
    }
  });
  return fetch(url).then((resp) => resp.json());
};

export const useQueryAggregateData = (
  params: AggregateAPIOptions,
  name: QueryNameOptions,
  queryReady: boolean
) => {
  const queryKeys = [name.toString()];
  Object.entries(params).forEach(([, value]) => queryKeys.push(value?.toString()));
  return useQuery({
    enabled: queryReady,
    queryKey: queryKeys,
    queryFn: () => fetchAggregateData(name, params),
  });
};

export const useQueryTravelTimes = (
  params: AggregateAPIOptions,
  name: QueryNameOptions,
  queryReady: boolean
) => {
  const queryKeys = [name.toString()];
  Object.entries(params).forEach(([, value]) => queryKeys.push(value?.toString()));
  return useQuery({
    enabled: queryReady,
    queryKey: queryKeys,
    queryFn: () => fetchTraveltimes(name, params),
  });
};

export const fetchTraveltimes = (
  name: string,
  options: AggregateAPIOptions
): Promise<TravelTimesRequest> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/aggregate/traveltimes2`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value?.forEach((subvalue) => url.searchParams.append(key, subvalue));
    } else {
      url.searchParams.append(key, value?.toString() || '');
    }
  });
  return fetch(url).then((resp) => resp.json());
};
