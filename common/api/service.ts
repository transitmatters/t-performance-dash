import type {
  FetchScheduledServiceOptions,
  FetchServiceHoursOptions,
  FetchServiceHoursResponse,
} from '../types/api';
import { FetchScheduledServiceParams } from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
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
  return await apiFetch({
    path: '/api/service_hours',
    options: withWeekStart(params),
    errorMessage: 'Failed to fetch service hours',
  });
};
