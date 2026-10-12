import { queryOptions, useQuery } from '@tanstack/react-query';
import type { FetchBusSpeedLeaderboardOptions, FetchBusTripMetricsOptions } from '../../types/api';
import { DATE_FORMAT, TODAY } from '../../constants/dates';
import { FIVE_MINUTES, ONE_HOUR } from '../../constants/time';
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

/**
 * Daily fleet stats for the whole bus system (route `all`), last 13 weeks through yesterday.
 * Daily because weekly and monthly rollups drop the fleet fields; ending yesterday gets the API's
 * hour-long cache rather than today's 15 minutes.
 */
export const systemBusFleetQuery = () => {
  const options: FetchBusTripMetricsOptions = {
    route: 'all',
    agg: 'daily',
    start_date: TODAY.subtract(13, 'weeks').format(DATE_FORMAT),
    end_date: TODAY.subtract(1, 'day').format(DATE_FORMAT),
  };
  return queryOptions({
    queryKey: ['busTripMetrics', options],
    queryFn: () => fetchBusTripMetricsByRoute(options),
    staleTime: ONE_HOUR,
  });
};
