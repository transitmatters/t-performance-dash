import type { PartialAggregateAPIOptions, PartialSingleDayAPIOptions } from '../types/api';
import { QueryNameKeys } from '../types/api';
import { APP_DATA_BASE_PATH } from '../../common/utils/constants';
import { getCurrentDate } from '../utils/date';
import type { AggregateDataResponse, SingleDayDataPoint } from '../types/charts';

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
  return name === QueryNameKeys.traveltimes ? responseJson : { by_date: responseJson };
};
