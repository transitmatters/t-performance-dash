import type { LineObject } from '../types/lines';
import { COLORS } from './colors';

export const LINE_OBJECTS: LineObject = {
  'line-red': {
    name: 'Red Line',
    short: 'Red',
    path: 'red',
    key: 'line-red',
    routes: ['line-red-a', 'line-red-b'],
    color: COLORS.mbta.red,
  },
  'line-orange': {
    name: 'Orange Line',
    short: 'Orange',
    path: 'orange',
    key: 'line-orange',
    routes: ['line-orange'],
    color: COLORS.mbta.orange,
  },
  'line-green': {
    name: 'Green Line',
    short: 'Green',
    path: 'green',
    key: 'line-green',
    routes: ['line-green-b', 'line-green-c', 'line-green-d', 'line-green-e'],
    color: COLORS.mbta.green,
  },
  'line-blue': {
    name: 'Blue Line',
    short: 'Blue',
    path: 'blue',
    key: 'line-blue',
    routes: ['line-blue'],
    color: COLORS.mbta.blue,
  },
  'line-bus': {
    name: 'Buses',
    short: 'Bus',
    path: 'bus',
    key: 'line-bus',
    color: COLORS.mbta.bus,
  },
};
