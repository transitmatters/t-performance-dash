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

export interface WindowDelta {
  current: number;
  prior: number | null;
  delta: number | null;
  percentChange: number | null;
}

export const getTrailingWindowDelta = (
  points: DatedValue[],
  reducer: Reducer,
  days = 30
): WindowDelta => {
  const dated = points.filter((point) => Number.isFinite(point.value));
  if (!dated.length) return { current: NaN, prior: null, delta: null, percentChange: null };

  const end = dayjs(
    dated.reduce((max, point) => (point.date > max ? point.date : max), dated[0].date)
  );
  const currentStart = end.subtract(days, 'day');
  const priorStart = end.subtract(days * 2, 'day');
  const between = (point: DatedValue, from: dayjs.Dayjs, to: dayjs.Dayjs) => {
    const d = dayjs(point.date);
    return d.isAfter(from) && (d.isSame(to, 'day') || d.isBefore(to));
  };

  const currentValues = dated.filter((p) => between(p, currentStart, end)).map((p) => p.value);
  const priorValues = dated.filter((p) => between(p, priorStart, currentStart)).map((p) => p.value);
  const current = reduce(currentValues, reducer);
  const prior = priorValues.length ? reduce(priorValues, reducer) : null;
  const delta = prior === null ? null : current - prior;
  const percentChange = prior ? (current - prior) / prior : null;
  return { current, prior, delta, percentChange };
};
