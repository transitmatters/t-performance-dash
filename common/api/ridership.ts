import { FetchRidershipParams } from '../types/api';
import type { FetchRidershipOptions } from '../types/api';
import type { RidershipCount } from '../types/dataPoints';
import { RIDERSHIP_KEYS, type Line } from '../types/lines';
import { getRidershipWeekStart } from '../utils/ridership';
import { apiFetch } from './utils/fetch';

function sumByDate(arrays: RidershipCount[][]) {
  const result: RidershipCount[] = [];
  arrays.forEach((array) => {
    array.forEach((count, i) => {
      if (!result[i]) {
        result[i] = { date: count.date, count: 0 };
      }
      result[i].count += count.count;
    });
  });
  return result;
}

export const fetchRidership = async (
  options: FetchRidershipOptions
): Promise<RidershipCount[] | undefined> => {
  const startDate = options[FetchRidershipParams.startDate];
  const params: FetchRidershipOptions = {
    ...options,
    ...(startDate && { [FetchRidershipParams.startDate]: getRidershipWeekStart(startDate) }),
  };

  // If we don't have a lineId, return a systemwide merged total
  if (!params[FetchRidershipParams.lineId]) {
    const ridershipCounts = await Promise.all(
      Object.values(RIDERSHIP_KEYS).map((lineId) =>
        apiFetch({
          path: '/api/ridership',
          options: { ...params, [FetchRidershipParams.lineId]: lineId },
          errorMessage: 'Failed to fetch ridership counts',
        })
      )
    );
    return sumByDate(ridershipCounts);
  }

  return await apiFetch({
    path: '/api/ridership',
    options: params,
    errorMessage: 'Failed to fetch ridership counts',
  });
};

export const fetchLandingRidership = async (): Promise<{ [key in Line]: RidershipCount[] }> => {
  const ridership_url = new URL(`/static/landing/ridership.json`, window.location.origin);
  return fetch(ridership_url.toString()).then((resp) => resp.json());
};
