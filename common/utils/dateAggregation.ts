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

/** Groups dated items by calendar month (dated the 1st), ordered oldest to newest. */
export const groupByCalendarMonth = <T extends { date: string }>(
  items: T[]
): { month: string; items: T[] }[] => {
  const byMonth = new Map<string, T[]>();
  for (const item of items) {
    const month = dayjs(item.date).startOf('month').format('YYYY-MM-DD');
    const monthItems = byMonth.get(month) ?? [];
    monthItems.push(item);
    byMonth.set(month, monthItems);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthItems]) => ({ month, items: monthItems }));
};

/** Groups dated points into calendar-month buckets, ordered oldest to newest. */
export const bucketByCalendarMonth = (points: DatedValue[]): MonthlyBucket[] =>
  groupByCalendarMonth(points).map(({ month, items }) => ({
    month,
    values: items.map((point) => point.value),
  }));

export interface TrailingWindows<T> {
  /** The latest date in the series, where the current window ends. */
  end: string;
  current: T[];
  prior: T[];
}

/**
 * Splits a dated series into the `days` up to and including its latest date, and the `days`
 * before those. Anchored to the data rather than today, so a feed that lags still fills both.
 */
export const splitTrailingWindows = <T extends { date: string }>(
  items: T[],
  days = 30
): TrailingWindows<T> | null => {
  if (!items.length) return null;
  const end = items.reduce((max, item) => (item.date > max ? item.date : max), items[0].date);
  const endDay = dayjs(end);
  const currentStart = endDay.subtract(days, 'day');
  const priorStart = endDay.subtract(days * 2, 'day');
  const between = (item: T, from: dayjs.Dayjs, to: dayjs.Dayjs) => {
    const d = dayjs(item.date);
    return d.isAfter(from) && (d.isSame(to, 'day') || d.isBefore(to));
  };
  return {
    end,
    current: items.filter((item) => between(item, currentStart, endDay)),
    prior: items.filter((item) => between(item, priorStart, currentStart)),
  };
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
