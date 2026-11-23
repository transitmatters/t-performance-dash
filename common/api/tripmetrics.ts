import type { FetchDeliveredTripMetricsOptions } from '../types/api';
import type { DeliveredTripMetrics } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { isLine } from '../utils/isLine';
import { withFleetMix } from './utils/fleetMix';
import { apiFetch } from './utils/fetch';

export const fetchActualTripsByLine = async (
  options: FetchDeliveredTripMetricsOptions
): Promise<DeliveredTripMetrics[]> => {
  const { start_date, end_date, agg, line } = withWeekStart(options);
  if (!start_date || !end_date || !agg || !line) return [];
  const rows = await apiFetch({
    path: '/api/tripmetrics',
    options: { start_date, end_date, agg, line },
    errorMessage: 'Failed to fetch trip metrics',
  });
  return rows.flatMap(({ line: rowLine, avg_car_age, pct_new_trips, ...row }) =>
    isLine(rowLine)
      ? [
          {
            ...withFleetMix(row),
            line: rowLine,
            avg_car_age: avg_car_age ?? undefined,
            pct_new_trips: pct_new_trips ?? undefined,
          },
        ]
      : []
  );
};
