import type { AlertsResponse, HistoricalAlert } from '../types/alerts';
import { AlertEffect } from '../types/alerts';
import type { ApiQuery, Schemas } from '../types/apiSchemas';
import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from '../types/lines';
import { getStationKeysFromStations } from '../utils/stations';
import { getBusRouteDataIds } from '../constants/lines';
import { apiFetch } from './utils/fetch';

const alertsAPIConfig = {
  activity: 'BOARD,EXIT,RIDE',
};

const accessibilityAlertsAPIConfig = {
  activity: 'USING_ESCALATOR,USING_WHEELCHAIR',
};

const ALERT_EFFECTS = new Map<string, AlertEffect>(
  Object.values(AlertEffect).map((effect) => [effect, effect])
);

// The spec leaves alert types open, so an effect the MBTA adds later reads as UNKNOWN_EFFECT.
const toAlertsResponse = ({
  type,
  stops,
  routes,
  ...alert
}: Schemas['LiveAlert']): AlertsResponse => ({
  ...alert,
  type: ALERT_EFFECTS.get(type) ?? AlertEffect.UNKNOWN_EFFECT,
  stops: stops.map(String),
  routes: routes ?? undefined,
});

type LiveAlertsQuery = ApiQuery<'/api/alerts'>;

const fetchLiveAlerts = async (options: LiveAlertsQuery, errorMessage: string) =>
  (await apiFetch({ path: '/api/alerts', options, errorMessage })).map(toAlertsResponse);

type RouteOptions = LiveAlertsQuery & { activity: string };

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

  return fetchLiveAlerts(options, `Failed to fetch alerts for line ${line}`);
};

const fetchAlertsForBus = async (busRoute: string): Promise<AlertsResponse[]> => {
  const options: RouteOptions = {
    ...alertsAPIConfig,
    route: getBusRouteDataIds(busRoute).join(','),
  };
  options['route_type'] = '3';

  return fetchLiveAlerts(options, `Failed to fetch alerts for bus route ${busRoute}`);
};

const fetchAlertsForCommuterRail = async (
  crRoute: CommuterRailRoute
): Promise<AlertsResponse[]> => {
  // route_type 2 is commuter rail
  const options: RouteOptions = { ...alertsAPIConfig, route: crRoute, route_type: '2' };

  return fetchLiveAlerts(options, `Failed to fetch alerts for commuter rail route ${crRoute}`);
};

export const fetchAccessibilityAlertsForLine = async (
  line: LineShort
): Promise<AlertsResponse[]> => {
  const stationKeys = getStationKeysFromStations(line);
  const options = { ...accessibilityAlertsAPIConfig, stop: stationKeys.join(',') };

  return fetchLiveAlerts(options, 'Failed to fetch accessibility alerts');
};

const GREEN_LINE_ROUTE_IDS = ['Green-B', 'Green-C', 'Green-D', 'Green-E'];

/** The route IDs historical alerts are tagged with, which never include "Green" or a combined bus label. */
export const getHistoricalAlertRoutes = (
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): string[] => {
  if (line === 'Bus' && busRoute) return getBusRouteDataIds(busRoute);
  if (line === 'Commuter Rail' && crRoute) return [crRoute];
  if (line === 'Ferry' && ferryRoute) return [ferryRoute];
  if (line === 'Green') return GREEN_LINE_ROUTE_IDS;
  return [line];
};

export const fetchHistoricalAlerts = async (
  date: string | undefined,
  line: LineShort,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): Promise<HistoricalAlert[]> => {
  // Null for dates before the archive starts, or when the day's archive can't be read.
  const alerts = await apiFetch({
    path: '/api/alerts/{user_date}',
    pathParams: { user_date: `${date}` },
    options: { route: getHistoricalAlertRoutes(line, busRoute, crRoute, ferryRoute) },
    errorMessage: 'Failed to fetch historical alerts',
  });
  return (alerts ?? []).map(({ valid_from, valid_to, text }) => ({
    valid_from,
    valid_to: valid_to ?? null,
    text: text ?? null,
  }));
};
