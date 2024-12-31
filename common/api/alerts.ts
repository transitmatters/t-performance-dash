import type { AlertsResponse, OldAlert } from '../types/alerts';
import type { LineShort } from '../types/lines';
import { getStationKeysFromStations } from '../utils/stations';
import { apiFetch } from './utils/fetch';

const alertsAPIConfig = {
  activity: 'BOARD,EXIT,RIDE',
};

const accessibilityAlertsAPIConfig = {
  activity: 'USING_ESCALATOR,USING_WHEELCHAIR',
};

export const fetchAlerts = async (
  line: LineShort,
  busRoute?: string
): Promise<AlertsResponse[]> => {
  if (line === 'Bus' && busRoute) {
    return fetchAlertsForBus(busRoute);
  }
  return fetchAlertsForLine(line);
};

const fetchAlertsForLine = async (line: LineShort): Promise<AlertsResponse[]> => {
  const options = { ...alertsAPIConfig };
  if (line === 'Green' || line === 'Mattapan') {
    // route_type 0 is light rail (green line & Mattapan)
    options['route_type'] = '0';
  } else {
    options['route_type'] = '1';
    options['route'] = line;
  }

  return await apiFetch({
    path: '/api/alerts',
    options,
    errorMessage: `Failed to fetch alerts for line ${line}`,
  });
};

const fetchAlertsForBus = async (busRoute: string): Promise<AlertsResponse[]> => {
  const options = { ...alertsAPIConfig, route: busRoute };
  options['route_type'] = '3';

  return await apiFetch({
    path: '/api/alerts',
    options,
    errorMessage: `Failed to fetch alerts for bus route ${busRoute}`,
  });
};

export const fetchAccessibilityAlertsForLine = async (
  line: LineShort
): Promise<AlertsResponse[]> => {
  const stationKeys = getStationKeysFromStations(line);
  const options = { ...accessibilityAlertsAPIConfig, stop: stationKeys.join(',') };

  return await apiFetch({
    path: '/api/alerts',
    options,
    errorMessage: 'Failed to fetch accessibility alerts',
  });
};

export const fetchHistoricalAlerts = async (
  date: string | undefined,
  line: LineShort,
  busRoute?: string
): Promise<OldAlert[]> => {
  const options = { route: '' };
  if (line === 'Bus' && busRoute) {
    options['route'] = busRoute;
  } else {
    options['route'] = line;
  }

  return await apiFetch({
    path: `/api/alerts/${date}`,
    options,
    errorMessage: 'Failed to fetch historical alerts',
  });
};
