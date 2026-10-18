import { FetchAlertDelaysByLineParams, type FetchAlertDelaysByLineOptions } from '../types/api';
import type { LineDelays } from '../types/delays';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchLineDelaysByLine = async (
  options: FetchAlertDelaysByLineOptions
): Promise<LineDelays[]> => {
  if (!options[FetchAlertDelaysByLineParams.line]) return [];

  return await apiFetch({
    path: '/api/linedelays',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch delay metrics',
  });
};
