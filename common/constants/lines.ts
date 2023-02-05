import { COLORS } from './colors';

export type Line = 'RL' | 'OL' | 'GL' | 'BL' | 'BUS';
export type LinePath = 'red' | 'orange' | 'green' | 'blue' | 'bus';
export type LineMetadata = {
  name: string;
  color: string;
  short: string;
  path: LinePath;
  key: Line;
};
export type LineObject = Record<Line, LineMetadata>;

export const LINE_OBJECTS: LineObject = {
  RL: {
    name: 'Red Line',
    short: 'Red',
    path: 'red',
    key: 'RL',
    color: COLORS.mbta.red,
  },
  OL: {
    name: 'Orange Line',
    short: 'Orange',
    path: 'orange',
    key: 'OL',
    color: COLORS.mbta.orange,
  },
  GL: {
    name: 'Green Line',
    short: 'Green',
    path: 'green',
    key: 'GL',
    color: COLORS.mbta.green,
  },
  BL: {
    name: 'Blue Line',
    short: 'Blue',
    path: 'blue',
    key: 'BL',
    color: COLORS.mbta.blue,
  },
  BUS: {
    name: 'Buses',
    short: 'Bus',
    path: 'bus',
    key: 'BUS',
    color: COLORS.mbta.bus,
  },
};
