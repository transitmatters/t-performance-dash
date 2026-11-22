import type { FetchDeliveredTripMetricsOptions } from '../types/api';
import { FetchDeliveredTripMetricsParams } from '../types/api';
import type { DeliveredTripMetrics } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { isLine } from '../utils/isLine';
import { apiFetch } from './utils/fetch';

export const fetchActualTripsByLine = async (
  options: FetchDeliveredTripMetricsOptions
): Promise<DeliveredTripMetrics[]> => {
  if (!options[FetchDeliveredTripMetricsParams.line]) return [];

  const rows = await apiFetch({
    path: '/api/tripmetrics',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch trip metrics',
  });
  return rows.flatMap(({ line, avg_car_age, pct_new_trips, ...row }) =>
    isLine(line)
      ? [
          {
            ...row,
            line,
            avg_car_age: avg_car_age ?? undefined,
            pct_new_trips: pct_new_trips ?? undefined,
          },
        ]
      : []
  );
};
