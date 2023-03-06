import type { AlertsResponse } from '../types/alerts';
import type { LineShort } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

const alertsAPIConfig = {
  activity: 'BOARD,EXIT,RIDE',
  datetime: 'NOW',
};

export const fetchAlertsForLine = async (route: LineShort): Promise<AlertsResponse[]> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/api/alerts`, window.location.origin);
  const options = { ...alertsAPIConfig };
  if (route === 'Green') {
    options['route_type'] = '0';
  } else {
    options['route_type'] = '1';
    options['route'] = route;
  }
  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  return await fetch(url.toString()).then((resp) => resp.json());
};
