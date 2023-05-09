import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals, fetchSpeedRestrictions } from '../slowzones';
import { ONE_HOUR } from '../../constants/time';

export const useSlowzoneAllData = () => {
  return useQuery(['allSlow'], fetchAllSlow, { staleTime: ONE_HOUR });
};

export const useSlowzoneDelayTotalData = () => {
  return useQuery(['delayTotals'], fetchDelayTotals, { staleTime: ONE_HOUR });
};

export const useSpeedRestrictionData = () => {
  return useQuery(['speedRestrictions'], fetchSpeedRestrictions);
};
