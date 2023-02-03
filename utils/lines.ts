import { LINE_OBJECTS } from '../constants/lines';
import { Line, LineShort } from '../types/lines';

export const lineTabs = [
  { name: 'Red Line', current: false, id: 'red' },
  { name: 'Blue Line', current: false, id: 'blue' },
  { name: 'Orange Line', current: false, id: 'orange' },
  { name: 'Green Line', current: false, id: 'green' },
  { name: 'Bus', current: false, id: 'bus' },
];

export const shortToLine = (name: LineShort): Exclude<Line, 'BUS'> => {
  const found = Object.entries(LINE_OBJECTS).find(([abv, line]) => line.short === name);
  return found?.[0] as Exclude<Line, 'BUS'>;
};
