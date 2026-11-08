import type { FetchDeliveredTripMetricsOptions } from '../types/api';
import { FetchDeliveredTripMetricsParams } from '../types/api';
import type { DeliveredTripMetrics } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchActualTripsByLine = async (
  options: FetchDeliveredTripMetricsOptions
): Promise<DeliveredTripMetrics[]> => {
  if (!options[FetchDeliveredTripMetricsParams.line]) return [];

  return await apiFetch({
    path: '/api/tripmetrics',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch trip metrics',
  });
};
