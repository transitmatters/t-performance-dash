import { useQuery } from '@tanstack/react-query';
import type { FetchTripCountsOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchTripCounts } from '../service';

export const useTripCounts = (params: FetchTripCountsOptions, enabled?: boolean) => {
  return useQuery(['trips', params], () => fetchTripCounts(params), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
