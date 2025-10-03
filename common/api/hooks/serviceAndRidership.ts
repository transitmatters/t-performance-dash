import { useQuery } from '@tanstack/react-query';
import { fetchServiceAndRidershipDashboardData } from '../serviceAndRidership';

export const useServiceAndRidershipDashboard = () => {
  return useQuery({
    queryKey: ['service-and-ridership'],
    queryFn: fetchServiceAndRidershipDashboardData,
  });
};
