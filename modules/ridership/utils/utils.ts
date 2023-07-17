import type { RidershipCount } from '../../../common/types/dataPoints';
import { PEAK_RIDERSHIP } from '../../../common/constants/baselines';
import type { BusRoute, Line } from '../../../common/types/lines';

export const getRidershipWidgetValues = (
  ridership: RidershipCount[],
  line: Line,
  busRoute?: BusRoute
) => {
  const routeIndex = busRoute ? busRoute.replaceAll('/', '') : line;
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;

  const percentage =
    ridership[ridership.length - 1]?.count / PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'];
  return { average: average, percentage: percentage };
};
