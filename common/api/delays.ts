import { FetchAlertDelaysByLineParams, type FetchAlertDelaysByLineOptions } from '../types/api';
import type { LineDelays } from '../types/delays';
import { apiFetch } from './utils/fetch';

export const fetchLineDelaysByLine = async (
  options: FetchAlertDelaysByLineOptions
): Promise<LineDelays[]> => {
  if (!options[FetchAlertDelaysByLineParams.line]) return [];

  return await apiFetch({
    path: '/api/linedelays',
    options,
    errorMessage: 'Failed to fetch delay metrics',
  });
};
