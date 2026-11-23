import type { FetchPredictionsParams } from '../types/api';
import type { TimePredictionWeek } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchPredictions = async (
  params: FetchPredictionsParams
): Promise<TimePredictionWeek[]> => {
  if (!params.route_id) return [];
  return await apiFetch({
    path: '/api/time_predictions',
    // An empty date means no bound, so it isn't sent.
    options: Object.fromEntries(Object.entries(params).filter(([, value]) => value)),
    errorMessage: 'Failed to fetch time predictions',
  });
};
