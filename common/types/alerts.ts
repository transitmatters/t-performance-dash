export type AlertTime = {
  end: string | null;
  start: string | null;
  upcoming: boolean;
  current: boolean;
};
export interface OldAlert {
  text: string;
  valid_from: string;
  valid_to: string;
}

export interface AlertForModal {
  applied: boolean;
  text: string;
  valid_from: string;
  valid_to: string;
}

export type UpcomingOrCurrent = 'upcoming' | 'current';

export interface FormattedAlert {
  id: string;
  type: AlertEffect;
  active_period: AlertTime[];
  relevantTimes: AlertTime[];
  stops: string[];
  routes?: string[];
  header: string;
}

export interface AlertsResponse {
  id: string;
  type: AlertEffect;
  active_period: AlertTime[];
  stops: string[];
  routes?: string[];
  header: string;
}
export type AlertEffectTypes = AlertEffect;

export enum AlertNames {
  DELAY = 'Delays',
  SHUTTLE = 'Shuttling',
  STOP_CLOSURE = 'Stop Closure',
  DETOUR = 'Detour',
  SUSPENSION = 'Suspension',
}

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
