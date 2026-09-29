import { useQuery } from '@tanstack/react-query';
import type { FetchReliabilityOptions } from '../../types/api';
import { fetchReliability } from '../reliability';
import { ONE_HOUR } from '../../constants/time';

export const useReliabilityData = (options: FetchReliabilityOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['reliability', options],
    queryFn: () => fetchReliability(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
