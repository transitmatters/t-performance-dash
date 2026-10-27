import dayjs from 'dayjs';

import { TODAY_STRING } from '../../../common/constants/dates';
import type { RidershipCount } from '../../../common/types/dataPoints';
import type { DatedValue } from '../../../common/utils/dateAggregation';
import { getTrailingWindowDelta, getMonthlyTrend } from '../../../common/utils/dateAggregation';
import type { ScorecardRow, DeltaSentiment, MetricKey } from './types';

/** The scorecard is calendar-month-shaped, so it fetches its own fixed trailing window
 * independent of the page's Week/Month/Year/All-time selector (which is trailing-N-days
 * and isn't guaranteed to contain a full prior calendar month). */
export const WINDOW_START = dayjs().subtract(400, 'day').format('YYYY-MM-DD');

/** The chart card shows the last 30 days with data, out of a 60-day fetch so a lagging feed
 * still fills the window. */
export const CHART_FETCH_START = dayjs(TODAY_STRING).subtract(60, 'day').format('YYYY-MM-DD');

/** Weekly series are dated by week start, so allow a few weeks before flagging data as old. */
const STALE_AFTER_DAYS = 21;

export const chartWindowStart = (lastDate: string) =>
  dayjs(lastDate).subtract(30, 'day').format('YYYY-MM-DD');

export const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Math.round(value).toLocaleString();
};

export const deltaSentimentFor = (
  delta: number | null,
  negligible: number,
  higherIsBetter: boolean
): DeltaSentiment => {
  if (delta === null || Math.abs(delta) <= negligible) return 'flat';
  const better = higherIsBetter ? delta > 0 : delta < 0;
  return better ? 'good' : 'bad';
};

export const buildRow = (params: {
  key: MetricKey;
  label: string;
  subtitle: string;
  points: DatedValue[];
  reducer: 'avg' | 'sum';
  unit: string;
  formatValue: (value: number) => string;
  negligibleDelta: number;
  higherIsBetter: boolean;
  color: string;
}): ScorecardRow | null => {
  const { current, delta } = getTrailingWindowDelta(params.points, params.reducer, 30);
  if (!Number.isFinite(current)) return null;
  const trend = getMonthlyTrend(params.points, params.reducer);
  const sentiment = deltaSentimentFor(delta, params.negligibleDelta, params.higherIsBetter);
  // The windows are anchored to the latest data, so say when that's well behind today (e.g.
  // commuter rail ridership, which lags by months).
  const lastDate = params.points.reduce(
    (max, point) => (point.date > max ? point.date : max),
    params.points[0].date
  );
  const isStale = dayjs(TODAY_STRING).diff(lastDate, 'day') > STALE_AFTER_DAYS;

  return {
    key: params.key,
    label: params.label,
    subtitle: isStale
      ? `${params.subtitle} · data through ${dayjs(lastDate).format('MMM D')}`
      : params.subtitle,
    formattedCurrent: params.formatValue(current),
    currentValue: current,
    formatValue: params.formatValue,
    unit: params.unit,
    deltaLabel:
      delta === null
        ? 'Not enough data'
        : `${delta > 0 ? '+' : ''}${params.formatValue(delta)} · ${sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse'}`,
    // Compact form for narrow (mobile) columns: just the signed change — the badge color already
    // carries better/worse, so the word is redundant where space is tight.
    deltaValueLabel: delta === null ? '—' : `${delta > 0 ? '+' : ''}${params.formatValue(delta)}`,
    deltaSentiment: sentiment,
    trend,
    color: params.color,
  };
};

export const buildRidershipRow = (data: RidershipCount[], color: string) =>
  buildRow({
    key: 'ridership',
    label: 'Ridership',
    subtitle: 'Fare validations, daily average',
    points: data.map((point) => ({ date: point.date, value: point.count })),
    reducer: 'avg',
    unit: '/day',
    formatValue: formatCompact,
    negligibleDelta: 50,
    higherIsBetter: true,
    color,
  });

/** Speed from trip metrics: miles covered over hours spent, skipping days with no service. */
export const toSpeedPoints = (
  data: { date: string; miles_covered: number; total_time: number }[]
): DatedValue[] =>
  data
    .filter((point) => point.miles_covered)
    .map((point) => ({
      date: point.date,
      value: point.miles_covered / (point.total_time / 3600),
    }));

/** Trim trailing days with no data (the feed lags a couple days) so the chart doesn't end in a
 * grey "No data" slab. */
export const trimTrailingEmpty = <T extends { miles_covered: number }>(data: T[]): T[] => {
  const lastIdx = data.map((p) => !!p.miles_covered).lastIndexOf(true);
  return lastIdx >= 0 ? data.slice(0, lastIdx + 1) : data;
};
