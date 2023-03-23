import type { FetchSpeedsOptions as FetchSpeedsOptions } from '../types/api';
import { FetchSpeedsParams as FetchSpeedsParams } from '../types/api';
import type { SpeedDataPoint as MedianSpeed, ScheduledSpeedDataPoint } from '../types/dataPoints';
import type { Line } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchScheduledSpeed = async (
  date: string,
  line?: Line
): Promise<ScheduledSpeedDataPoint[] | undefined> => {
  if (!line) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/scheduledSpeed`, window.location.origin);
  url.searchParams.append('line', line);
  url.searchParams.append('date', date);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch speed');
  }
  return await response.json();
};

export const fetchSpeeds = async (
  params: FetchSpeedsOptions
): Promise<MedianSpeed[] | undefined> => {
  if (!params[FetchSpeedsParams.line]) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/speed`, window.location.origin);
  Object.keys(params).forEach((paramKey) => {
    url.searchParams.append(paramKey, params[paramKey]);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch traversal times');

  return await response.json();
};
