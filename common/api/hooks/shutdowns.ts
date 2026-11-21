import { useQueries, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FetchShutdownsOptions } from '../../types/api';
import type { Shutdown } from '../../types/shutdowns';
import { ONE_HOUR } from '../../constants/time';
import { fetchShutdowns } from '../shutdowns';

export const useShutdownsData = (options: FetchShutdownsOptions, enabled?: boolean) => {
  return useQuery({
    queryKey: ['shutdowns', options],
    queryFn: () => fetchShutdowns(options),
    enabled: enabled,
    staleTime: ONE_HOUR,
  });
};

// Defined once so React Query keeps returning the same array until a query's data changes.
const dataOnly = (results: UseQueryResult<Shutdown[]>[]) => results.map((result) => result.data);

/** Shutdowns on each of these lines over the same dates, one request per line, in line order. */
export const useShutdownsForLines = (
  lines: string[],
  startDate: string | undefined,
  endDate: string | undefined,
  enabled: boolean
) =>
  useQueries({
    queries: lines.map((line) => {
      const options: FetchShutdownsOptions = {
        line,
        start_date: startDate,
        end_date: endDate,
      };
      return {
        queryKey: ['shutdowns', options],
        queryFn: () => fetchShutdowns(options),
        enabled: enabled && Boolean(startDate && endDate),
        staleTime: ONE_HOUR,
      };
    }),
    combine: dataOnly,
  });
