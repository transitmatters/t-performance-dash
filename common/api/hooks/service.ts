import { useQuery } from '@tanstack/react-query';
import type { FetchScheduledServiceOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchScheduledService } from '../service';

export const useScheduledService = (options: FetchScheduledServiceOptions, enabled?: boolean) => {
  return useQuery(['scheduledservice', options], () => fetchScheduledService(options), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
