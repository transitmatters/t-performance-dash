import { useQuery } from '@tanstack/react-query';
import type { FetchBusSpeedLeaderboardOptions, FetchBusTripMetricsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';
import { fetchBusSpeedLeaderboard, fetchBusTripMetricsByRoute } from '../busTripMetrics';

export const useBusTripMetrics = (options: FetchBusTripMetricsOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['busTripMetrics', options],
    queryFn: () => fetchBusTripMetricsByRoute(options),
    enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useBusSpeedLeaderboard = (
  options: FetchBusSpeedLeaderboardOptions,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: ['busSpeedLeaderboard', options],
    queryFn: () => fetchBusSpeedLeaderboard(options),
    enabled,
    staleTime: FIVE_MINUTES,
  });
};
