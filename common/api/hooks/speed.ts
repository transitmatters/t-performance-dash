import { useQueries, useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../speed';
import type { FetchSpeedsOptions } from '../../types/api';
import { FIVE_MINUTES, ONE_HOUR } from '../../constants/time';
import { ONE_YEAR_AGO_STRING, TODAY_STRING } from '../../constants/dates';
import { HEAVY_RAIL_LINES } from '../../types/lines';

export const useSpeedData = (params: FetchSpeedsOptions, enabled?: boolean) => {
  return useQuery(['speed', params], () => fetchSpeeds(params), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useSpeedDataLanding = () => {
  return useQueries({
    queries: HEAVY_RAIL_LINES.map((line) => {
      const params: FetchSpeedsOptions = {
        line: line,
        start_date: ONE_YEAR_AGO_STRING,
        end_date: TODAY_STRING,
        agg: 'weekly',
      };
      return {
        queryKey: [`${line}-speed`],
        queryFn: () => fetchSpeeds(params),
        staleTime: ONE_HOUR,
      };
    }),
  });
};
