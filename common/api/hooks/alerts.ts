import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchHistoricalAlerts } from '../alerts';
import type { LineShort } from '../../types/lines';
import { FIVE_MINUTES, ONE_MINUTE } from '../../constants/time';
import type { AlertsResponse } from '../../types/alerts';

export const useHistoricalAlertsData = (
  date: string | undefined,
  route: LineShort,
  busRoute?: string
) => {
  return useQuery(
    ['alerts', date, route, busRoute],
    () => fetchHistoricalAlerts(date, route, busRoute),
    {
      staleTime: FIVE_MINUTES,
      enabled: date !== undefined,
    }
  );
};

export const useAlertsData = (
  route: LineShort,
  busRoute?: string
): UseQueryResult<AlertsResponse[]> => {
  return useQuery(['alerts', route, busRoute], () => fetchAlerts(route, busRoute), {
    staleTime: ONE_MINUTE,
  });
};
