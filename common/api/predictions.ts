import type { FetchPredictionsParams } from '../types/api';
import type { TimePredictionWeek } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchPredictions = async (
  params: FetchPredictionsParams
): Promise<TimePredictionWeek[]> => {
  if (!params.route_id) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/time_predictions`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch time predictions');

  return await response.json();
};
