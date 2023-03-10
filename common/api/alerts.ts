import type { AlertsResponse } from '../types/alerts';
import type { LineShort } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

const alertsAPIConfig = {
  activity: 'BOARD,EXIT,RIDE',
};

export const fetchAlertsForLine = async (route: LineShort): Promise<AlertsResponse[]> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/api/alerts`, window.location.origin);
  const options = { ...alertsAPIConfig };
  if (route === 'Green') {
    // route_type 0 is light rail (green line & Mattapan)
    options['route_type'] = '0';
  } else {
    options['route_type'] = '1';
    options['route'] = route;
  }
  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return await response.json();
};
