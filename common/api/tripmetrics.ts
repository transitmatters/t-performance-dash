import type { SpeedPairData } from '../../modules/speed/map/segment';
import type {
  FetchDeliveredTripMetricsOptions,
  FetchSegmentTripMetricsOptions,
} from '../types/api';
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

export const fetchSegmentTripMetrics = async (
  options: FetchSegmentTripMetricsOptions
): Promise<SpeedPairData[]> => {
  if (!options.line) return [];

  return await apiFetch({
    path: '/api/tripmetrics/segment',
    options,
    errorMessage: 'Failed to fetch segment trip metrics',
  });
};
