import { LINE_OBJECTS } from '../constants/lines';
import type { LineShort } from '../types/lines';

export const shortToLine = (name: LineShort): Exclude<LineShort, 'Bus'> => {
  const found = Object.entries(LINE_OBJECTS).find(([, line]) => line.short === name);
  return found?.[0] as Exclude<LineShort, 'Bus'>;
};
