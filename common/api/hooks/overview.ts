import { queryOptions, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { fetchOverview } from '../overview';

export const overviewQuery = queryOptions({
  queryKey: ['overview'],
  queryFn: fetchOverview,
  staleTime: ONE_HOUR,
});

export const useOverviewData = () => useQuery(overviewQuery);
