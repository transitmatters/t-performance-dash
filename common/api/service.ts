import type {
  FetchScheduledServiceOptions,
  FetchServiceHoursOptions,
  FetchServiceHoursResponse,
} from '../types/api';
import { FetchScheduledServiceParams } from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchScheduledService = async (
  options: FetchScheduledServiceOptions
): Promise<ScheduledService | undefined> => {
  if (!options[FetchScheduledServiceParams.routeId]) return undefined;

  return await apiFetch({
    path: '/api/scheduledservice',
    options,
    errorMessage: 'Failed to fetch trip counts',
  });
};

export const fetchServiceHours = async (
  params: FetchServiceHoursOptions
): Promise<FetchServiceHoursResponse | undefined> => {
  if (!params.start_date) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/service_hours`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch service hours');
  return await response.json();
};
