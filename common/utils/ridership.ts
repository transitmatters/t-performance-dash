import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

export const getRidershipLineId = (
  line: Line | undefined,
  busRoute: BusRoute | undefined,
  crRoute: CommuterRailRoute | undefined,
  ferryRoute: FerryRoute | undefined
) => {
  if (line === 'line-bus' && busRoute) {
    switch (busRoute) {
      case '34':
        return 'line-3434E';
      case '57':
        return 'line-5757A';
      case 'CT2':
        return 'line-747';
      case 'CT3/171':
        return 'line-171708';
      case 'SL1/SL2/SL3/SLW':
        return 'line-SLWaterfront';
      case 'SL4/SL5':
        return 'line-SLWashington';
      default:
        return `line-${busRoute.replaceAll('/', '')}`;
    }
  } else if (line === 'line-commuter-rail' && crRoute) {
    return `line-${crRoute.substring(3)}`;
  } else if (line === 'line-ferry' && ferryRoute) {
    return `line-${ferryRoute}`;
  } else {
    return RIDERSHIP_KEYS[line ?? ''];
  }
};
