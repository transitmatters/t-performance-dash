import { queryOptions, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { fetchServiceAndRidershipDashboardData } from '../serviceAndRidership';

export const serviceAndRidershipQuery = queryOptions({
  queryKey: ['serviceAndRidership'],
  queryFn: fetchServiceAndRidershipDashboardData,
  // A static file, rebuilt daily
  staleTime: ONE_HOUR,
});

export const useServiceAndRidershipDashboard = () => {
  return useQuery(serviceAndRidershipQuery);
};
