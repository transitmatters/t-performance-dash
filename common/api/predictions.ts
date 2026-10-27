import type { FetchPredictionsParams } from '../types/api';
import type { TimePredictionWeek } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';
import { fetchOrThrow } from './utils/ApiError';

export const fetchPredictions = async (
  params: FetchPredictionsParams
): Promise<TimePredictionWeek[]> => {
  if (!params.route_id) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/time_predictions`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetchOrThrow(
    url.toString(),
    undefined,
    'Failed to fetch time predictions'
  );

  return await response.json();
};
