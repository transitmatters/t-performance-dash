import type { LineObject } from '../types/lines';
import { COLORS } from './colors';

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

export const lineTabs = [
  { name: 'Red Line', current: false, id: 'red' },
  { name: 'Blue Line', current: false, id: 'blue' },
  { name: 'Orange Line', current: false, id: 'orange' },
  { name: 'Green Line', current: false, id: 'green' },
  { name: 'Bus', current: false, id: 'bus' },
];
