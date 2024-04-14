import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchHistoricalAlerts, fetchAccessibilityAlertsForLine } from '../alerts';
import type { LineShort } from '../../types/lines';
import { FIVE_MINUTES, ONE_MINUTE } from '../../constants/time';
import type { AlertsResponse } from '../../types/alerts';

export const useHistoricalAlertsData = (
  date: string | undefined,
  line: LineShort,
  busRoute?: string
) => {
  return useQuery({
    queryKey: ['alerts', date, line, busRoute],
    queryFn: () => fetchHistoricalAlerts(date, line, busRoute),
    staleTime: FIVE_MINUTES,
    enabled: date !== undefined,
  });
};

export const useAlertsData = (
  line: LineShort,
  busRoute?: string
): UseQueryResult<AlertsResponse[]> => {
  return useQuery({
    queryKey: ['alerts', line, busRoute],
    queryFn: () => fetchAlerts(line, busRoute),
    staleTime: ONE_MINUTE,
  });
};

export const useAccessibilityAlertsData = (line: LineShort) => {
  return useQuery({
    queryKey: ['accessibilityAlerts', line],
    queryFn: () => fetchAccessibilityAlertsForLine(line),
    staleTime: ONE_MINUTE,
  });
};
