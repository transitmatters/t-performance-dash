import dayjs from 'dayjs';

export interface DatedValue {
  date: string;
  value: number;
}

interface MonthlyBucket {
  /** First-of-month ISO date, e.g. "2026-08-01" */
  month: string;
  values: number[];
}

type Reducer = 'avg' | 'sum';

const reduce = (values: number[], reducer: Reducer): number => {
  if (!values.length) return NaN;
  const total = values.reduce((sum, value) => sum + value, 0);
  return reducer === 'sum' ? total : total / values.length;
};

/** Groups dated points into calendar-month buckets, ordered oldest to newest. */
export const bucketByCalendarMonth = (points: DatedValue[]): MonthlyBucket[] => {
  const byMonth = new Map<string, number[]>();
  for (const point of points) {
    const month = dayjs(point.date).startOf('month').format('YYYY-MM-DD');
    const values = byMonth.get(month) ?? [];
    values.push(point.value);
    byMonth.set(month, values);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({ month, values }));
};

export interface MonthlyDelta {
  thisMonth: number;
  priorMonth: number | null;
  delta: number | null;
  percentChange: number | null;
}

/**
 * Reduces a dated series into "this calendar month" vs. "the prior calendar month" —
 * "this month" is the most recent bucket present in `points`, not necessarily the
 * current wall-clock month, so it still works against data that lags a few days.
 */
export const getMonthlyDelta = (points: DatedValue[], reducer: Reducer): MonthlyDelta => {
  const buckets = bucketByCalendarMonth(points);
  const thisMonthBucket = buckets[buckets.length - 1];
  const priorMonthBucket = buckets[buckets.length - 2];
  const thisMonth = thisMonthBucket ? reduce(thisMonthBucket.values, reducer) : NaN;
  const priorMonth = priorMonthBucket ? reduce(priorMonthBucket.values, reducer) : null;
  const delta = priorMonth === null ? null : thisMonth - priorMonth;
  const percentChange = priorMonth ? (thisMonth - priorMonth) / priorMonth : null;
  return { thisMonth, priorMonth, delta, percentChange };
};

/** One reduced value per calendar month, oldest to newest — sparkline input. */
export const getMonthlyTrend = (points: DatedValue[], reducer: Reducer): number[] =>
  bucketByCalendarMonth(points).map((bucket) => reduce(bucket.values, reducer));
