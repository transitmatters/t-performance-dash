export type Line = 'Red' | 'Orange' | 'Blue' | 'Green';

export interface Direction {
  0: string;
  1: string;
}

export interface Station {
  stop_name: string;
  branches: string[] | null;
  station: string;
  order: number;
  disabled?: boolean;
  stops: {
    '0': string[];
    '1': string[];
  };
}

export interface LineMap {
  type: string;
  direction: Direction;
  stations: Station[];
}
