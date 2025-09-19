import type { RidershipCount } from '../../../common/types/dataPoints';
import { PEAK_RIDERSHIP } from '../../../common/constants/baselines';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../../common/types/lines';
import type { RidershipKey } from '../../../common/types/ridership';

export const getRidershipWidgetValues = (
  ridership: RidershipCount[],
  line?: Line,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  const routeIndex = (crRoute ??
    ferryRoute ??
    (busRoute ? busRoute.replaceAll('/', '') : line)) as RidershipKey;
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  const percentage =
    ridership[ridership.length - 1]?.count / PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT'];
  return { average: average, percentage: percentage, peak: peak };
};
