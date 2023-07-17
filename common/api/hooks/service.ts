import { useQuery } from '@tanstack/react-query';
import type { FetchScheduledServiceOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchScheduledService } from '../service';

export const useScheduledService = (params: FetchScheduledServiceOptions, enabled?: boolean) => {
  return useQuery(['scheduledservice', params], () => fetchScheduledService(params), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
