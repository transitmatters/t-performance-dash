import { FetchRidershipParams } from '../types/api';
import type { FetchRidershipOptions } from '../types/api';
import type { RidershipCount } from '../types/dataPoints';
import { type Line } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchRidership = async (
  params: FetchRidershipOptions
): Promise<RidershipCount[] | undefined> => {
  if (!params[FetchRidershipParams.lineId]) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/ridership`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch ridership counts');
  return await response.json();
};

export const fetchLandingRidership = async (): Promise<{ [key in Line]: RidershipCount[] }> => {
  const ridership_url = new URL(`/static/landing/ridership.json`, window.location.origin);
  return fetch(ridership_url.toString()).then((resp) => resp.json());
};
