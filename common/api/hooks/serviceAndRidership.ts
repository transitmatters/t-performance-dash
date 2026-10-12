import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchServiceAndRidershipDashboardData } from '../serviceAndRidership';

export const serviceAndRidershipQuery = queryOptions({
  queryKey: ['service-and-ridership'],
  queryFn: fetchServiceAndRidershipDashboardData,
});

export const useServiceAndRidershipDashboard = () => {
  return useQuery(serviceAndRidershipQuery);
};
