import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from './lines';
import type { Filled, Schemas } from './apiSchemas';

/** Whose alerts to show: a page's line and route, or a whole line. */
export interface AlertsScope {
  lineShort: LineShort;
  busRoute?: BusRoute;
  crRoute?: CommuterRailRoute;
  ferryRoute?: FerryRoute;
}

export type AlertTime = Schemas['AlertActivePeriod'];

/** `text` is null when the feed had neither a header nor a short header; `valid_to`, with no announced end. */
export type HistoricalAlert = Filled<Schemas['Alert']>;

export type UpcomingOrCurrent = 'upcoming' | 'current';

/** A live alert, with its effect narrowed to the ones we know and stop IDs as strings. */
export type AlertsResponse = Schemas['LiveAlert'] & {
  type: AlertEffect;
  stops: string[];
  routes?: string[];
};

export enum AlertEffect {
  ACCESS_ISSUE = 'ACCESS_ISSUE',
  ADDITIONAL_SERVICE = 'ADDITIONAL_SERVICE',
  BIKE_ISSUE = 'BIKE_ISSUE',
  CANCELLATION = 'CANCELLATION',
  DELAY = 'DELAY',
  DETOUR = 'DETOUR',
  DOCK_CLOSURE = 'DOCK_CLOSURE',
  DOCK_ISSUE = 'DOCK_ISSUE',
  ELEVATOR_CLOSURE = 'ELEVATOR_CLOSURE',
  ESCALATOR_CLOSURE = 'ESCALATOR_CLOSURE',
  EXTRA_SERVICE = 'EXTRA_SERVICE',
  FACILITY_ISSUE = 'FACILITY_ISSUE',
  MODIFIED_SERVICE = 'MODIFIED_SERVICE',
  NO_SERVICE = 'NO_SERVICE',
  OTHER_EFFECT = 'OTHER_EFFECT',
  PARKING_CLOSURE = 'PARKING_CLOSURE',
  PARKING_ISSUE = 'PARKING_ISSUE',
  POLICY_CHANGE = 'POLICY_CHANGE',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  SERVICE_CHANGE = 'SERVICE_CHANGE',
  SHUTTLE = 'SHUTTLE',
  SNOW_ROUTE = 'SNOW_ROUTE',
  STATION_CLOSURE = 'STATION_CLOSURE',
  STATION_ISSUE = 'STATION_ISSUE',
  STOP_CLOSURE = 'STOP_CLOSURE',
  STOP_MOVE = 'STOP_MOVE',
  STOP_MOVED = 'STOP_MOVED',
  SUMMARY = 'SUMMARY',
  SUSPENSION = 'SUSPENSION',
  TRACK_CHANGE = 'TRACK_CHANGE',
  UNKNOWN_EFFECT = 'UNKNOWN_EFFECT',
}
