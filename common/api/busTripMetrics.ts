import type { FetchBusSpeedLeaderboardOptions, FetchBusTripMetricsOptions } from '../types/api';
import type { BusSpeedLeaderboardEntry, DeliveredTripMetricsBus } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';
import { withFleetMix } from './utils/fleetMix';

export const fetchBusTripMetricsByRoute = async (
  options: FetchBusTripMetricsOptions
): Promise<DeliveredTripMetricsBus[]> => {
  const { start_date, end_date, route, ...rest } = withWeekStart(options);
  if (!start_date || !end_date || !route) return [];
  const rows = await apiFetch({
    path: '/api/bustripmetrics',
    options: { ...rest, start_date, end_date, route },
    errorMessage: 'Failed to fetch bus trip metrics',
  });
  return rows.map(withFleetMix);
};

export const fetchBusSpeedLeaderboard = async (
  options: FetchBusSpeedLeaderboardOptions
): Promise<BusSpeedLeaderboardEntry[]> => {
  const { start_date, end_date, ...rest } = options;
  if (!start_date || !end_date) return [];
  return await apiFetch({
    path: '/api/busspeedleaderboard',
    options: { ...rest, start_date, end_date },
    errorMessage: 'Failed to fetch bus speed leaderboard',
  });
};
