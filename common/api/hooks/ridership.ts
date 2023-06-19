import { useQueries, useQuery } from '@tanstack/react-query';
import type { FetchRidershipOptions } from '../../types/api';
import { fetchRidership } from '../ridership';
import { ONE_HOUR } from '../../constants/time';
import type { Line } from '../../types/lines';
import { RIDERSHIP_KEYS } from '../../types/lines';
import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../constants/dates';

export const useRidershipData = (params: FetchRidershipOptions, enabled?: boolean) => {
  return useQuery(['trips', params], () => fetchRidership(params), {
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

export const useRidershipDataLanding = (lines: Line[]) => {
  return useQueries({
    queries: lines.map((line) => {
      const params: FetchRidershipOptions = {
        line_id: RIDERSHIP_KEYS[line],
        start_date: THREE_MONTHS_AGO_STRING,
        end_date: TODAY_STRING,
      };
      return {
        queryKey: [`${line}-ridership`],
        queryFn: () => fetchRidership(params),
        staleTime: ONE_HOUR,
      };
    }),
  });
};
