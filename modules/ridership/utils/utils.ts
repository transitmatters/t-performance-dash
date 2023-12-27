import type { RidershipCount } from '../../../common/types/dataPoints';
import { PEAK_RIDERSHIP } from '../../../common/constants/baselines';
import {
  RIDERSHIP_KEYS,
  type BusRoute,
  type CommuterRailRoute,
  type Line,
} from '../../../common/types/lines';

export const getRidershipWidgetValues = (
  ridership: RidershipCount[],
  line?: Line,
  busRoute?: BusRoute
) => {
  const routeIndex = busRoute ? busRoute.replaceAll('/', '') : line;
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  const percentage =
    ridership[ridership.length - 1]?.count / PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'];
  return { average: average, percentage: percentage, peak: peak };
};

export const getRidershipLineId = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute
): string => {
  if (busRoute) {
    return `line-${busRoute.replaceAll('/', '')}`;
  } else if (crRoute) {
    return `line-${crRoute.substring(3)}`;
  } else {
    return RIDERSHIP_KEYS[line ?? ''];
  }
};
