import type { FetchActualTripsByLineOptions, FetchActualTripsByRouteOptions } from '../types/api';
import { FetchActualTripsByLineParams, FetchActualTripsByRouteParams } from '../types/api';
import type { DailyTrip, SpeedByLine } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchActualTripsByRoute = async (
  params: FetchActualTripsByRouteOptions
): Promise<DailyTrip[]> => {
  if (!params[FetchActualTripsByRouteParams.route]) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/dailytrips`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch trip metrics');

  return await response.json();
};

export const fetchActualTripsByLine = async (
  params: FetchActualTripsByLineOptions
): Promise<SpeedByLine[]> => {
  if (!params[FetchActualTripsByLineParams.line]) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/tripsbyline`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch trip metrics');

  return await response.json();
};
