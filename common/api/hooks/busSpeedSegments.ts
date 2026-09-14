import { useQuery } from '@tanstack/react-query';
import type { FetchBusSpeedSegmentsOptions } from '../../../modules/busspeedmap/types';
import { ONE_DAY } from '../../constants/time';
import { fetchBusSpeedSegmentsUrl } from '../busSpeedSegments';

export const useBusSpeedSegmentsUrl = (
  options: FetchBusSpeedSegmentsOptions,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: ['busSpeedSegmentsUrl', options],
    queryFn: () => fetchBusSpeedSegmentsUrl(options),
    enabled: enabled,
    // A published service date never changes, so a day of both freshness and retention
    // makes flipping back to an already-viewed date instant instead of a re-check.
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
};
