import type { BusRoute, CommuterRailRoute, Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

export const getRidershipLineId = (
  line: Line | undefined,
  busRoute: BusRoute | undefined,
  crRoute: CommuterRailRoute | undefined
) => {
  if (line === 'line-bus' && busRoute) {
    switch (busRoute) {
      case '34':
        return 'line-3434E';
      case '57':
        return 'line-5757A';
      case 'CT2':
        return 'line-747';
      default:
        return `line-${busRoute.replaceAll('/', '')}`;
    }
  } else if (line === 'line-commuter-rail' && crRoute) {
    return `line-${crRoute.substring(3)}`;
  } else {
    return RIDERSHIP_KEYS[line ?? ''];
  }
};
