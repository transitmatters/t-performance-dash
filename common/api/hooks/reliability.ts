import { useQuery } from '@tanstack/react-query';
import type { FetchExcessTripTimeOptions, FetchReliabilityOptions } from '../../types/api';
import { fetchExcessTripTime, fetchReliability } from '../reliability';
import { ONE_HOUR } from '../../constants/time';

export const useReliabilityData = (options: FetchReliabilityOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['reliability', options],
    queryFn: () => fetchReliability(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useExcessTripTimeData = (options: FetchExcessTripTimeOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['excessTripTime', options],
    queryFn: () => fetchExcessTripTime(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
