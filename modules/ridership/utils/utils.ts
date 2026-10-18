import type { RidershipCount } from '../../../common/types/dataPoints';

export const getRidershipWidgetValues = (ridership: RidershipCount[], peakRidership: number) => {
  const average = ridership.reduce((sum, current) => sum + current.count, 0) / ridership.length;
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  const percentage = ridership[ridership.length - 1]?.count / peakRidership;
  return { average: average, percentage: percentage, peak: peak };
};
