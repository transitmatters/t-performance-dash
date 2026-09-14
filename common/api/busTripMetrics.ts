import type { FetchBusSpeedLeaderboardOptions, FetchBusTripMetricsOptions } from '../types/api';
import { FetchBusTripMetricsParams } from '../types/api';
import type { BusSpeedLeaderboardEntry, DeliveredTripMetricsBus } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchBusTripMetricsByRoute = async (
  options: FetchBusTripMetricsOptions
): Promise<DeliveredTripMetricsBus[]> => {
  if (!options[FetchBusTripMetricsParams.route]) return [];

  return await apiFetch({
    path: '/api/bustripmetrics',
    options,
    errorMessage: 'Failed to fetch bus trip metrics',
  });
};

export const fetchBusSpeedLeaderboard = async (
  options: FetchBusSpeedLeaderboardOptions
): Promise<BusSpeedLeaderboardEntry[]> => {
  if (!options.start_date || !options.end_date) return [];

  return await apiFetch({
    path: '/api/busspeedleaderboard',
    options,
    errorMessage: 'Failed to fetch bus speed leaderboard',
  });
};
