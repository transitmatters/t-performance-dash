import type { RidershipCount } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { PEAK_RIDERSHIP } from '../../../common/constants/baselines';

export const getRidershipWidgetValues = (ridership: RidershipCount[], line?: Line) => {
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;
  const percentage = ridership[ridership.length - 1]?.count / PEAK_RIDERSHIP[line ?? 'DEFAULT'];
  return { average: average, percentage: percentage };
};
