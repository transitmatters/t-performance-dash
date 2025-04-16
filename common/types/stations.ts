import type { BusRoute, CommuterRailRoute, LineShort } from './lines';

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
  service_start?: string;
  service_end?: string;
  stations: Station[];
  service_start?: string;
  service_end?: string;
}

export type StationMap = {
  [key in LineShort]:
    | LineMap
    | { [key in CommuterRailRoute]: LineMap }
    | { [key in BusRoute]: LineMap };
};
