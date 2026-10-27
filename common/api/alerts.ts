import type { AlertsResponse, OldAlert } from '../types/alerts';
import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from '../types/lines';
import { getStationKeysFromStations } from '../utils/stations';
import { getBusRouteIds } from '../constants/lines';
import { apiFetch } from './utils/fetch';

const alertsAPIConfig = {
  activity: 'BOARD,EXIT,RIDE',
};

const accessibilityAlertsAPIConfig = {
  activity: 'USING_ESCALATOR,USING_WHEELCHAIR',
};

type RouteOptions = {
  route?: string;
  activity: string;
  route_type?: string;
};

export const fetchAlerts = async (
  line: LineShort,
  busRoute?: string,
  crRoute?: CommuterRailRoute
): Promise<AlertsResponse[]> => {
  if (line === 'Bus' && busRoute) {
    return fetchAlertsForBus(busRoute);
  }
  if (line === 'Commuter Rail' && crRoute) {
    return fetchAlertsForCommuterRail(crRoute);
  }
  return fetchAlertsForLine(line);
};

const fetchAlertsForLine = async (line: LineShort): Promise<AlertsResponse[]> => {
  const options: RouteOptions = { ...alertsAPIConfig };
  if (line === 'Green' || line === 'Mattapan') {
    // route_type 0 is light rail (green line & Mattapan)
    options['route_type'] = '0';
    if (line === 'Mattapan') {
      options['route'] = 'Mattapan';
    }
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
  const options: RouteOptions = { ...alertsAPIConfig, route: getBusRouteIds(busRoute).join(',') };
  options['route_type'] = '3';

  return await apiFetch({
    path: '/api/alerts',
    options,
    errorMessage: `Failed to fetch alerts for bus route ${busRoute}`,
  });
};

const fetchAlertsForCommuterRail = async (
  crRoute: CommuterRailRoute
): Promise<AlertsResponse[]> => {
  // route_type 2 is commuter rail
  const options: RouteOptions = { ...alertsAPIConfig, route: crRoute, route_type: '2' };

  return await apiFetch({
    path: '/api/alerts',
    options,
    errorMessage: `Failed to fetch alerts for commuter rail route ${crRoute}`,
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
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): Promise<OldAlert[]> => {
  const options = { route: '' };
  if (line === 'Bus' && busRoute) {
    options['route'] = busRoute;
  } else if (line === 'Commuter Rail' && crRoute) {
    options['route'] = crRoute;
  } else if (line === 'Ferry' && ferryRoute) {
    options['route'] = ferryRoute;
  } else {
    options['route'] = line;
  }

  return await apiFetch({
    path: `/api/alerts/${date}`,
    options,
    errorMessage: 'Failed to fetch historical alerts',
  });
};
