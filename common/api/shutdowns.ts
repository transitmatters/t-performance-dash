import type { FetchShutdownsOptions } from '../types/api';
import type { Shutdown, ShutdownEffect } from '../types/shutdowns';
import { apiFetch } from './utils/fetch';

const SHUTDOWN_EFFECTS: ShutdownEffect[] = ['SHUTTLE', 'SUSPENSION', 'STATION_CLOSURE'];
const isShutdownEffect = (value: string): value is ShutdownEffect =>
  SHUTDOWN_EFFECTS.some((effect) => effect === value);

// The spec leaves effects open; one this page doesn't know how to draw is left out.
export const fetchShutdowns = async (options: FetchShutdownsOptions): Promise<Shutdown[]> => {
  const { start_date, end_date, line } = options;
  if (!start_date || !end_date || !line) return [];
  const shutdowns = await apiFetch({
    path: '/api/shutdowns',
    options: { start_date, end_date, line },
    errorMessage: 'Failed to fetch shutdowns',
  });
  return shutdowns.flatMap(({ effect, cause, ...shutdown }) =>
    isShutdownEffect(effect) ? [{ ...shutdown, effect, cause: cause ?? null }] : []
  );
};
