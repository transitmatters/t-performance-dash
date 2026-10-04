import type { RidershipCount } from '../../../common/types/dataPoints';

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

/**
 * Headline KPIs for the Ridership page's summary cards, derived entirely from data already fetched
 * for the chart (no extra requests). The average delta is trailing-vs-leading half of the selected
 * range — a "trending up/down over this window" signal, not a fresh query.
 */
export const getRidershipStats = (ridership: RidershipCount[], peakRidership: number) => {
  const counts = ridership.filter((point) => point.count !== null).map((point) => point.count);
  const [c1, c2] = halves(counts);
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  const percentage = ridership[ridership.length - 1]?.count / peakRidership;
  return {
    average: mean(counts),
    averageDelta: mean(c2) - mean(c1),
    percentage,
    peakCount: peak?.count,
    peakDate: peak?.date,
  };
};
