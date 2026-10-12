import { useQuery } from '@tanstack/react-query';
import type { FetchCrTripMetricsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';
import { fetchCrTripMetricsByRoute } from '../crTripMetrics';

export const useCrTripMetrics = (options: FetchCrTripMetricsOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['crTripMetrics', options],
    queryFn: () => fetchCrTripMetricsByRoute(options),
    enabled,
    staleTime: FIVE_MINUTES,
  });
};
