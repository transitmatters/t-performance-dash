import dayjs from 'dayjs';
import type { RidershipCount } from '../../../common/types/dataPoints';
import { PRETTY_DATE_FORMAT } from '../../../common/constants/dates';
import type { SeasonalMaximum } from '../../../common/utils/seasonalRidership';
import { halvesComparison, statDelta } from '../../../common/utils/statDelta';

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

/**
 * Headline KPIs for the Ridership page's summary cards, derived entirely from data already fetched
 * for the chart (no extra requests). The average's change compares the leading and trailing halves
 * of the selected range — a "trending up/down over this window" signal, not a fresh query.
 *
 * The percentage compares the newest week with the most riders in the same week of past years when
 * `seasonalMaximumFor` has it (see `seasonalPeak`), and with the all-time `peakRidership` otherwise.
 */
export const getRidershipStats = (
  ridership: RidershipCount[],
  peakRidership: number,
  seasonalMaximumFor?: (date: string) => SeasonalMaximum | undefined
) => {
  const withCounts = ridership.filter((point) => point.count !== null);
  const counts = withCounts.map((point) => point.count);
  const [c1, c2] = halves(counts);
  const peak = ridership.reduce(
    (max, datapoint) => (datapoint.count > max.count ? datapoint : max),
    ridership[0]
  );
  // The newest week can have no count yet; the chart leaves it out, so this does too.
  const latest = withCounts[withCounts.length - 1];
  const seasonalPeak = latest && seasonalMaximumFor?.(latest.date);
  const percentage = latest ? latest.count / (seasonalPeak?.value ?? peakRidership) : NaN;
  return {
    average: mean(counts),
    averageBefore: mean(c1),
    averageAfter: mean(c2),
    percentage,
    seasonalPeak,
    peakCount: peak?.count,
    peakDate: peak?.date,
  };
};

const riders = (value: number) => Math.round(value).toLocaleString('en-us');

/** Change badge for average weekday riders, second half of the range vs. the first. */
export const ridershipDelta = (before: number, after: number) =>
  statDelta({
    delta: after - before,
    negligible: 1,
    magnitude: `${after > before ? '+' : ''}${riders(after - before)}`,
    words: ['up', 'down'],
    ...halvesComparison(before, after, riders),
  });

export const getOutOfServiceMessage = (
  startDate: string,
  endDate: string,
  serviceStart: string | undefined,
  serviceEnd: string | undefined
) => {
  if (serviceEnd && !dayjs(serviceEnd).isAfter(startDate)) {
    return `Service ended ${dayjs(serviceEnd).format(PRETTY_DATE_FORMAT)}.`;
  }
  if (serviceStart && !dayjs(serviceStart).isBefore(endDate)) {
    return `Service began ${dayjs(serviceStart).format(PRETTY_DATE_FORMAT)}.`;
  }
  return undefined;
};
