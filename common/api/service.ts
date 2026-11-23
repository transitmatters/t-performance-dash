import type {
  FetchScheduledServiceOptions,
  FetchServiceHoursOptions,
  FetchServiceHoursResponse,
} from '../types/api';
import type { ScheduledService } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchScheduledService = async (
  options: FetchScheduledServiceOptions
): Promise<ScheduledService | undefined> => {
  const { start_date, end_date, route_id, agg } = withWeekStart(options);
  if (!start_date || !end_date || !route_id || !agg) return undefined;
  return await apiFetch({
    path: '/api/scheduledservice',
    options: { start_date, end_date, route_id, agg },
    errorMessage: 'Failed to fetch trip counts',
  });
};

export const fetchServiceHours = async (
  params: FetchServiceHoursOptions
): Promise<FetchServiceHoursResponse | undefined> => {
  const { line_id, start_date, end_date, agg } = withWeekStart(params);
  if (!line_id || !start_date || !end_date || !agg) return undefined;
  return await apiFetch({
    path: '/api/service_hours',
    options: { line_id, start_date, end_date, agg },
    errorMessage: 'Failed to fetch service hours',
  });
};
