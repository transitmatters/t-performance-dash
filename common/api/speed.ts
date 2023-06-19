import type { FetchSpeedsOptions as FetchSpeedsOptions } from '../types/api';
import { FetchSpeedsParams as FetchSpeedsParams } from '../types/api';
import type { SpeedDataPoint } from '../types/dataPoints';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchSpeeds = async (params: FetchSpeedsOptions): Promise<SpeedDataPoint[]> => {
  if (!params[FetchSpeedsParams.line]) return [];
  const url = new URL(`${APP_DATA_BASE_PATH}/api/speed`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    if (params[FetchSpeedsParams.line] === 'line-green')
      url.searchParams.append(paramKey, 'line-green-glx');
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch traversal times');

  return await response.json();
};
