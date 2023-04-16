import { useQuery } from '@tanstack/react-query';
import { fetchAllRidership } from '../ridership';
import { TWELVE_HOURS } from '../../constants/time';

export const useRidershipData = () => {
  return useQuery(['allRidership'], fetchAllRidership, { staleTime: TWELVE_HOURS });
};
