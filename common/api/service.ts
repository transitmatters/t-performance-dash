import type { FetchTripCountsOptions } from '../types/api';
import { FetchTripCountsParams } from '../types/api';
import type { TripCounts } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchTripCounts = async (
  params: FetchTripCountsOptions
): Promise<TripCounts | undefined> => {
  if (!params[FetchTripCountsParams.routeId]) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/tripcounts`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch traversal times');

  return await response.json();
};
