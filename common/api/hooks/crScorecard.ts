import { useQuery } from '@tanstack/react-query';
import type { FetchCrScorecardOptions } from '../../types/api';
import { fetchCrScorecard } from '../crScorecard';
import { ONE_HOUR } from '../../constants/time';

export const useCrScorecard = (options: FetchCrScorecardOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['crScorecard', options],
    queryFn: () => fetchCrScorecard(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};
