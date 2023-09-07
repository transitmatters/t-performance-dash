import type { FetchSpeedsOptions as FetchSpeedsOptions } from '../types/api';
import { FetchSpeedsParams as FetchSpeedsParams } from '../types/api';
import type { SpeedDataPoint } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchSpeeds = async (options: FetchSpeedsOptions): Promise<SpeedDataPoint[]> => {
  if (!options[FetchSpeedsParams.line]) return [];

  return await apiFetch({
    path: '/api/speed',
    options,
    errorMessage: 'Failed to fetch traversal times',
  });
};
