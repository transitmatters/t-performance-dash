import { COLORS } from './colors';

export type Line = 'RL' | 'OL' | 'GL' | 'BL' | 'BUS';
export type LineMetadata = { name: string; color: string; short: string; key: Line };
export type LineObject = Record<Line, LineMetadata>;

export const LINE_OBJECTS: LineObject = {
  RL: {
    name: 'Red Line',
    short: 'Red',
    key: 'RL',
    color: COLORS.mbta.red,
  },
  OL: {
    name: 'Orange Line',
    short: 'Orange',
    key: 'OL',
    color: COLORS.mbta.orange,
  },
  GL: {
    name: 'Green Line',
    short: 'Green',
    key: 'GL',
    color: COLORS.mbta.green,
  },
  BL: {
    name: 'Blue Line',
    short: 'Blue',
    key: 'BL',
    color: COLORS.mbta.blue,
  },
  BUS: {
    name: 'Buses',
    short: 'Bus',
    key: 'BUS',
    color: COLORS.mbta.bus,
  },
};
