import type { FetchScheduledServiceOptions } from '../types/api';
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
