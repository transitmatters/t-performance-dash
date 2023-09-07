import { useQuery } from '@tanstack/react-query';
import type { FetchRidershipOptions } from '../../types/api';
import { fetchLandingRidership, fetchRidership } from '../ridership';
import { ONE_HOUR } from '../../constants/time';

export const useRidershipData = (options: FetchRidershipOptions, enabled?: boolean) => {
  return useQuery(['trips', options], () => fetchRidership(options), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useRidershipDataLanding = () => {
  return useQuery(['ridership-landing'], () => fetchLandingRidership());
};
