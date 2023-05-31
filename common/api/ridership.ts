import type { LineData, SummaryData } from '../types/ridership';
import { FetchRidershipParams } from '../types/api';
import type { FetchRidershipOptions } from '../types/api';
import type { RidershipCount } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchAllRidership = (): Promise<{
  summaryData: SummaryData;
  lineData: Record<string, LineData>;
}> => {
  const all_ridership_url = new URL(`/ridership.json`, window.location.origin);
  return fetch(all_ridership_url.toString()).then((resp) => resp.json());
};

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
