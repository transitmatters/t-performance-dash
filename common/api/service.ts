import type { FetchScheduledServiceOptions } from '../types/api';
import { FetchScheduledServiceParams } from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchScheduledService = async (
  params: FetchScheduledServiceOptions
): Promise<ScheduledService | undefined> => {
  if (!params[FetchScheduledServiceParams.routeId]) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/scheduledservice`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch trip counts');

  return await response.json();
};
