import type { BusRoute, CommuterRailRoute, FerryRoute, LineShort } from './lines';

/**
 * Direction keys and their names. Bus, commuter rail and ferry keys are the GTFS `direction_id`
 * ("0" is outbound). Rapid transit keys are the reverse of GTFS: "0" is northbound/eastbound,
 * which GTFS calls direction 1. Use `LineMap.gtfs_direction_id` to convert.
 */
interface Direction {
  0: string;
  1: string;
}

export interface Station {
  stop_name: string;
  branches: string[] | null;
  station: string;
  order: number;
  stops: {
    '0': string[];
    '1': string[];
  };
  accessible?: boolean;
  pedal_park?: boolean;
  enclosed_bike_parking?: boolean;
  terminus?: boolean;
  disabled?: boolean;
  short?: string;
}

export const isLineMap = (obj: any): obj is LineMap => {
  return obj && typeof obj === 'object' && 'stations' in obj && Array.isArray(obj.stations);
};

export interface LineMap {
  type: string;
  direction: Direction;
  /** GTFS `direction_id` for each direction key. Only set on rapid transit lines, where they differ. */
  gtfs_direction_id?: { '0': number; '1': number };
  stations: Station[];
  service_start?: string;
  service_end?: string;
}

export type StationMap = {
  [key in Exclude<LineShort, 'The RIDE'>]:
    | LineMap
    | { [key in CommuterRailRoute]: LineMap }
    | { [key in BusRoute]: LineMap }
    | { [key in FerryRoute]: LineMap };
};
