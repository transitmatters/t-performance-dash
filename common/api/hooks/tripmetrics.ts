import { useQueries, useQuery } from '@tanstack/react-query';
import type { FetchDeliveredTripMetricsOptions } from '../../types/api';
import { FIVE_MINUTES, ONE_HOUR } from '../../constants/time';
import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../constants/dates';
import { LANDING_RAIL_LINES } from '../../types/lines';
import { fetchActualTripsByLine } from '../tripmetrics';

export const useDeliveredTripMetrics = (
  params: FetchDeliveredTripMetricsOptions,
  enabled?: boolean
) => {
  return useQuery(['actualTrips', params], () => fetchActualTripsByLine(params), {
    enabled: enabled,
    staleTime: FIVE_MINUTES,
  });
};

export const useTripMetricsForLanding = () => {
  return useQueries({
    queries: LANDING_RAIL_LINES.map((line) => {
      const params: FetchDeliveredTripMetricsOptions = {
        line: line,
        start_date: THREE_MONTHS_AGO_STRING,
        end_date: TODAY_STRING,
        agg: 'weekly',
      };
      return {
        queryKey: [`${line}-speed`],
        queryFn: () => fetchActualTripsByLine(params),
        staleTime: ONE_HOUR,
      };
    }),
  });
};
