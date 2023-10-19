import { useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../speed';
import type { FetchSpeedsOptions } from '../../types/api';
import { FIVE_MINUTES } from '../../constants/time';

export const useSpeedData = (options: FetchSpeedsOptions, enabled?: boolean) => {
  return useQuery(['speed', options], () => fetchSpeeds(options), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};
