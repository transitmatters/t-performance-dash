import type { FetchDeliveredTripMetricsOptions } from '../types/api';
import { FetchDeliveredTripMetricsParams } from '../types/api';
import type { DeliveredTripMetrics } from '../types/dataPoints';
import type { Line } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchActualTripsByLine = async (
  params: FetchDeliveredTripMetricsOptions
): Promise<DeliveredTripMetrics[]> => {
  if (!params[FetchDeliveredTripMetricsParams.line]) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/tripmetrics`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch trip metrics');
  return await response.json();
};

export const fetchLandingTripMetrics = (): Promise<{ [key in Line]: DeliveredTripMetrics[] }> => {
  const tripMetricsURL = new URL(`/static/landing/trip_metrics.json`, window.location.origin);
  return fetch(tripMetricsURL.toString()).then((resp) => resp.json());
};
