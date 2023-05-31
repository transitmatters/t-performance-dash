import { useQuery } from '@tanstack/react-query';
import type { FetchRidershipOptions } from '../../types/api';
import { fetchRidership } from '../ridership';
import { ONE_HOUR } from '../../constants/time';

export const useRidershipData = (params: FetchRidershipOptions, enabled?: boolean) => {
  return useQuery(['trips', params], () => fetchRidership(params), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
