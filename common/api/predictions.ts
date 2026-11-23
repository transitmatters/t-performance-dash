import type { FetchPredictionsParams } from '../types/api';
import type { TimePredictionWeek } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchPredictions = async (
  params: FetchPredictionsParams
): Promise<TimePredictionWeek[]> => {
  const { route_id, start_date, end_date } = params;
  if (!route_id) return [];
  return await apiFetch({
    path: '/api/time_predictions',
    // An empty date means no bound, so it isn't sent.
    options: { route_id, start_date: start_date || undefined, end_date: end_date || undefined },
    errorMessage: 'Failed to fetch time predictions',
  });
};
