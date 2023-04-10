import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../alerts';
import type { LineShort } from '../../types/lines';

export const useAlertsData = (route: LineShort, busRoute?: string) => {
  return useQuery(['alerts', route, busRoute], () => fetchAlerts(route, busRoute));
};
