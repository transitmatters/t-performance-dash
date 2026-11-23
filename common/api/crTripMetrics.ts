import type { FetchCrTripMetricsOptions } from '../types/api';
import type { DeliveredTripMetricsCR } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';
import { withFleetMix } from './utils/fleetMix';

export const fetchCrTripMetricsByRoute = async (
  options: FetchCrTripMetricsOptions
): Promise<DeliveredTripMetricsCR[]> => {
  const { start_date, end_date, route, agg } = withWeekStart(options);
  if (!start_date || !end_date || !route) return [];
  const rows = await apiFetch({
    path: '/api/crtripmetrics',
    options: { start_date, end_date, route, agg },
    errorMessage: 'Failed to fetch commuter rail trip metrics',
  });
  return rows.map(withFleetMix);
};
