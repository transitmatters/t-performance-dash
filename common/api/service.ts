import type {
  FetchScheduledServiceOptions,
  FetchServiceHoursOptions,
  FetchServiceHoursResponse,
} from '../types/api';
import { FetchScheduledServiceParams } from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';
import { withWeekStart } from '../utils/date';
import { apiFetchUnchecked } from './utils/fetch';
import { fetchOrThrow } from './utils/ApiError';

export const fetchScheduledService = async (
  options: FetchScheduledServiceOptions
): Promise<ScheduledService | undefined> => {
  if (!options[FetchScheduledServiceParams.routeId]) return undefined;

  return await apiFetchUnchecked({
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
  Object.entries(weekParams).forEach(([paramKey, value]) => {
    url.searchParams.append(paramKey, String(value));
  });
  const response = await fetchOrThrow(url.toString(), undefined, 'Failed to fetch service hours');
  return await response.json();
};
