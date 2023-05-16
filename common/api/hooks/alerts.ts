import { useQuery } from '@tanstack/react-query';
import { fetchAccessibilityAlertsForLine, fetchAlerts } from '../alerts';
import type { LineShort } from '../../types/lines';
import { ONE_MINUTE } from '../../constants/time';

export const useAlertsData = (route: LineShort, busRoute?: string) => {
  return useQuery(['alerts', route, busRoute], () => fetchAlerts(route, busRoute), {
    staleTime: ONE_MINUTE,
  });
};

export const useAccessibilityAlertsData = (route: LineShort) => {
  return useQuery(['accessibilityAlerts', route], () => fetchAccessibilityAlertsForLine(route), {
    staleTime: ONE_MINUTE,
  });
};
