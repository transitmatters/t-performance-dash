import { useQueries, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { fetchLineDelaysByLine } from '../delays';
import type { FetchAlertDelaysByLineOptions } from '../../types/api';

export const useAlertDelays = (options: FetchAlertDelaysByLineOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['lineDelays', options],
    queryFn: () => fetchLineDelaysByLine(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

/** Daily delays for each of these date spans (YYYY-MM-DD, inclusive), one request per span. */
export const useDailyAlertDelays = (line: string | undefined, spans: [string, string][]) =>
  useQueries({
    queries: spans.map(([start, end]) => {
      const options: FetchAlertDelaysByLineOptions = {
        start_date: start,
        end_date: end,
        line,
        agg: 'daily',
      };
      return {
        queryKey: ['lineDelays', options],
        queryFn: () => fetchLineDelaysByLine(options),
        enabled: Boolean(line),
        staleTime: ONE_HOUR,
      };
    }),
  });
