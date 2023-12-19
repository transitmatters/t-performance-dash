import { useQuery } from '@tanstack/react-query';
import type { FetchDeliveredTripMetricsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';
import { fetchActualTripsByLine, fetchLandingTripMetrics } from '../tripmetrics';

export const useDeliveredTripMetrics = (
  options: FetchDeliveredTripMetricsOptions,
  enabled?: boolean
) => {
  return useQuery(['actualTrips', options], () => fetchActualTripsByLine(options), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useTripMetricsForLanding = () => {
  return useQuery(['landingTrips'], () => fetchLandingTripMetrics());
};
