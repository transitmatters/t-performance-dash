import type { fetchLineTraversalTimesOptions } from '../types/api';
import { FetchLineTraversalTimeParams } from '../types/api';
import type { MedianTraversalTime, SpeedMetric } from '../types/dataPoints';
import type { Line } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchSpeed = async (line?: Line): Promise<SpeedMetric[] | undefined> => {
  if (!line) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/speed`, window.location.origin);
  url.searchParams.append('line', line);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch speed');
  }
  return await response.json();
};

export const fetchLineTraversalTimes = async (
  params: fetchLineTraversalTimesOptions
): Promise<MedianTraversalTime[] | undefined> => {
  if (!params[FetchLineTraversalTimeParams.line]) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/traversal`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch traversal times');

  return await response.json();
};
