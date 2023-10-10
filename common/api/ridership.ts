import { FetchRidershipParams } from '../types/api';
import type { FetchRidershipOptions } from '../types/api';
import type { RidershipCount } from '../types/dataPoints';
import { type Line } from '../types/lines';
import { apiFetch } from './utils/fetch';

export const fetchRidership = async (
  options: FetchRidershipOptions
): Promise<RidershipCount[] | undefined> => {
  if (!options[FetchRidershipParams.lineId]) return undefined;

  return await apiFetch({
    path: '/api/ridership',
    options,
    errorMessage: 'Failed to fetch ridership counts',
  });
};

export const fetchLandingRidership = async (): Promise<{ [key in Line]: RidershipCount[] }> => {
  const ridership_url = new URL(`/static/landing/ridership.json`, window.location.origin);
  return fetch(ridership_url.toString()).then((resp) => resp.json());
};
