import type {
  FetchScheduledServiceOptions,
  FetchServiceHoursOptions,
  FetchServiceHoursResponse,
} from '../types/api';
import { FetchScheduledServiceParams } from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchScheduledService = async (
  options: FetchScheduledServiceOptions
): Promise<ScheduledService | undefined> => {
  if (!options[FetchScheduledServiceParams.routeId]) return undefined;

  return await apiFetch({
    path: '/api/scheduledservice',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch trip counts',
  });
};

export const fetchServiceHours = async (
  params: FetchServiceHoursOptions
): Promise<FetchServiceHoursResponse | undefined> => {
  if (!params.start_date) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/service_hours`, window.location.origin);
  const weekParams = withWeekStart(params);
  Object.keys(weekParams).forEach((paramKey) => {
    url.searchParams.append(paramKey, weekParams[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch service hours');
  return await response.json();
};
