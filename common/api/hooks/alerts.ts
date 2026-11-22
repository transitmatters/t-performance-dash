import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchHistoricalAlerts, fetchAccessibilityAlertsForLine } from '../alerts';
import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from '../../types/lines';
import { FIVE_MINUTES, ONE_MINUTE } from '../../constants/time';
import type { AlertsResponse, HistoricalAlert } from '../../types/alerts';
import { findMatch } from '../../components/alerts/AlertFilter';

export const useHistoricalAlertsData = (
  date: string | undefined,
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  return useQuery({
    queryKey: ['alerts', date, line, busRoute, crRoute, ferryRoute],
    queryFn: () => fetchHistoricalAlerts(date, line, busRoute, crRoute, ferryRoute),
    staleTime: FIVE_MINUTES,
    enabled: date !== undefined,
  });
};

const selectMatching = (alerts: HistoricalAlert[]) => alerts.filter(findMatch);

/**
 * A day's alerts in a format we know how to place on a chart ("Reduced speeds", "Up to 15 minutes").
 * Shares its cache with `useHistoricalAlertsData`.
 */
export const useMatchingAlerts = (
  date: string | undefined,
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) =>
  useQuery({
    queryKey: ['alerts', date, line, busRoute, crRoute, ferryRoute],
    queryFn: () => fetchHistoricalAlerts(date, line, busRoute, crRoute, ferryRoute),
    select: selectMatching,
    staleTime: FIVE_MINUTES,
    enabled: date !== undefined,
  });

export const useAlertsData = (
  line: LineShort,
  busRoute?: string,
  crRoute?: CommuterRailRoute
): UseQueryResult<AlertsResponse[]> => {
  return useQuery({
    queryKey: ['alerts', line, busRoute, crRoute],
    queryFn: () => fetchAlerts(line, busRoute, crRoute),
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
