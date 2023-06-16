import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchHistoricalAlerts } from '../alerts';
import type { LineShort } from '../../types/lines';
import { FIVE_MINUTES, ONE_MINUTE } from '../../constants/time';

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

export const useAlertsData = (route: LineShort, busRoute?: string) => {
  return useQuery(['alerts', route, busRoute], () => fetchAlerts(route, busRoute), {
    staleTime: ONE_MINUTE,
  });
};
