import { queryOptions, useQuery } from '@tanstack/react-query';
import type { FetchDeliveredTripMetricsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';
import { fetchActualTripsByLine, fetchLandingTripMetrics } from '../tripmetrics';

export const useDeliveredTripMetrics = (
  options: FetchDeliveredTripMetricsOptions,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: ['actualTrips', options],
    queryFn: () => fetchActualTripsByLine(options),
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const tripMetricsLandingQuery = queryOptions({
  queryKey: ['landingTrips'],
  queryFn: () => fetchLandingTripMetrics(),
});

export const useTripMetricsForLanding = () => {
  return useQuery(tripMetricsLandingQuery);
};
