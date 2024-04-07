import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals, fetchSpeedRestrictions } from '../slowzones';
import { ONE_HOUR } from '../../constants/time';
import type { FetchSpeedRestrictionsOptions } from '../../types/api';

export const useSlowzoneAllData = () => {
  return useQuery({ queryKey: ['allSlow'], queryFn: fetchAllSlow, staleTime: ONE_HOUR });
};

export const useSlowzoneDelayTotalData = () => {
  return useQuery({ queryKey: ['delayTotals'], queryFn: fetchDelayTotals, staleTime: ONE_HOUR });
};

export const useSpeedRestrictionData = (options: FetchSpeedRestrictionsOptions) => {
  return useQuery({
    queryKey: ['speedRestrictions', options],
    queryFn: () => fetchSpeedRestrictions(options),
    enabled: options.date !== undefined,
    staleTime: ONE_HOUR,
  });
};
