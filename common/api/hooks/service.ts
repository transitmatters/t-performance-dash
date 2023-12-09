import { useQuery } from '@tanstack/react-query';
import type { FetchScheduledServiceOptions, FetchServiceHoursOptions } from '../../types/api';
import { ONE_HOUR } from '../../constants/time';
import { fetchScheduledService, fetchServiceHours } from '../service';

export const useScheduledService = (options: FetchScheduledServiceOptions, enabled?: boolean) => {
  return useQuery(['scheduledservice', options], () => fetchScheduledService(options), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useServiceHours = (params: FetchServiceHoursOptions, enabled?: boolean) => {
  return useQuery(['service_hours', params], () => fetchServiceHours(params), {
    enabled: enabled,
    staleTime: 0,
  });
};
