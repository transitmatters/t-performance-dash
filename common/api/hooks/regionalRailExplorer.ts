import { useQuery } from '@tanstack/react-query';
import type { RreJourneyParams } from '../../types/regionalRailExplorer';
import { fetchRreJourneys } from '../regionalRailExplorer';
import { ONE_DAY } from '../../constants/time';

export const useRreJourneys = (params: RreJourneyParams, enabled?: boolean) => {
  return useQuery({
    queryKey: ['rreJourneys', params],
    queryFn: () => fetchRreJourneys(params),
    enabled,
    // The Explorer's schedules only change when it deploys
    staleTime: ONE_DAY,
  });
};
