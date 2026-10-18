import type { FetchReliabilityOptions } from '../types/api';
import type { ReliabilityEntry } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchReliability = async (
  options: FetchReliabilityOptions
): Promise<ReliabilityEntry[]> => {
  return await apiFetch({
    path: '/api/reliability',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch reliability data',
  });
};
