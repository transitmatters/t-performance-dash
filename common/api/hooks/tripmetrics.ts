import { useQuery } from '@tanstack/react-query';
import type {
  FetchDeliveredTripMetricsOptions,
  FetchSegmentTripMetricsOptions,
} from '../../types/api';
import { FIVE_MINUTES, THIRTY_MINUTES } from '../../constants/time';
import {
  fetchActualTripsByLine,
  fetchLandingTripMetrics,
  fetchSegmentTripMetrics,
} from '../tripmetrics';

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

export const useTripMetricsForLanding = () => {
  return useQuery({ queryKey: ['landingTrips'], queryFn: () => fetchLandingTripMetrics() });
};

export const useSegmentTripMetricsData = (
  options: FetchSegmentTripMetricsOptions,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['segmentTripMetrics', options],
    queryFn: () => fetchSegmentTripMetrics(options),
    enabled: enabled && !!options.date,
    staleTime: THIRTY_MINUTES,
  });
};
