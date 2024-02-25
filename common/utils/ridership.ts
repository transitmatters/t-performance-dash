import type { BusRoute, Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

export const getRidershipLineId = (line: Line | undefined, busRoute: BusRoute | undefined) => {
  if (line === 'line-bus' && busRoute) {
    switch (busRoute) {
      case '34':
        return 'line-3434E';
      case '57':
        return 'line-5757A';
      default:
        return `line-${busRoute.replaceAll('/', '')}`;
    }
  } else {
    return RIDERSHIP_KEYS[line ?? ''];
  }
};
