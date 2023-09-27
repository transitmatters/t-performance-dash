import type { FetchDeliveredTripMetricsOptions } from '../types/api';
import { FetchDeliveredTripMetricsParams } from '../types/api';
import type { DeliveredTripMetrics } from '../types/dataPoints';
import type { Line } from '../types/lines';
import { apiFetch } from './utils/fetch';

export const fetchActualTripsByLine = async (
  options: FetchDeliveredTripMetricsOptions
): Promise<DeliveredTripMetrics[]> => {
  if (!options[FetchDeliveredTripMetricsParams.line]) return [];

  return await apiFetch({
    path: '/api/tripmetrics',
    options,
    errorMessage: 'Failed to fetch trip metrics',
  });
};

export const fetchLandingTripMetrics = (): Promise<{ [key in Line]: DeliveredTripMetrics[] }> => {
  const tripMetricsURL = new URL(`/static/landing/trip_metrics.json`, window.location.origin);
  return fetch(tripMetricsURL.toString()).then((resp) => resp.json());
};
