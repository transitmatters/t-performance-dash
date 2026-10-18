import type { FetchCrTripMetricsOptions } from '../types/api';
import type { DeliveredTripMetricsCR } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchCrTripMetricsByRoute = async (
  options: FetchCrTripMetricsOptions
): Promise<DeliveredTripMetricsCR[]> => {
  if (!options.route) return [];

  return await apiFetch({
    path: '/api/crtripmetrics',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch commuter rail trip metrics',
  });
};
