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

// Retired 2026-09-21: the upstream ArcGIS source data-ingestion reads from is
// gone (400 upstream), and the SpeedRestrictions table hasn't had a new row
// since 2026-05-31. The backend clamps out-of-range dates to the latest row
// and still reports it as "available", so left on this silently renders
// 4-month-stale restrictions as current. Disabled here pending a reply from
// the T on whether the dataset moved; restore `options.date !== undefined`
// once it's live again.
export const useSpeedRestrictionData = (options: FetchSpeedRestrictionsOptions) => {
  return useQuery({
    queryKey: ['speedRestrictions', options],
    queryFn: () => fetchSpeedRestrictions(options),
    enabled: false,
    staleTime: ONE_HOUR,
  });
};
