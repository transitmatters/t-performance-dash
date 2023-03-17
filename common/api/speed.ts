import type { Line } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchSpeed = async (line?: Line): Promise<any> => {
  if (!line) return undefined;
  const url = new URL(`${APP_DATA_BASE_PATH}/api/speed`, window.location.origin);
  url.searchParams.append('line', line);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return await response.json();
};
