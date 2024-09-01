import type { RidershipCount } from '../../../common/types/dataPoints';
import { PEAK_RIDERSHIP } from '../../../common/constants/baselines';
import type { BusRoute, CommuterRailRoute, Line } from '../../../common/types/lines';

export const getRidershipWidgetValues = (
  ridership: RidershipCount[],
  line?: Line,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute
) => {
  const routeIndex = crRoute ?? (busRoute ? busRoute.replaceAll('/', '') : line);
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  const percentage =
    ridership[ridership.length - 1]?.count / PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'];
  return { average: average, percentage: percentage, peak: peak };
};
