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

export const isLineMap = (obj: LineMap | Station[]): obj is LineMap => {
  return (obj as LineMap).stations !== undefined;
};

export interface LineMap {
  type: string;
  direction: Direction;
  stations: Station[];
}
