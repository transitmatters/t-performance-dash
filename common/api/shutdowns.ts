import type { FetchShutdownsOptions } from '../types/api';
import type { Shutdown } from '../types/shutdowns';
import { apiFetch } from './utils/fetch';

export const fetchShutdowns = async (options: FetchShutdownsOptions): Promise<Shutdown[]> =>
  apiFetch({
    path: '/api/shutdowns',
    options,
    errorMessage: 'Failed to fetch shutdowns',
  });
