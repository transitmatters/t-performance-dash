import dayjs from 'dayjs';
import type { BaselineMetric, HistoricalBaselines } from '../../../common/types/baselines';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import type { LineData } from '../../serviceAndRidership/types';
import { METRICS, MIN_WEEKS } from '../config';
import type { Cell, MetricId, Unit } from '../types';
import { combineCoverage, goalCoverage } from './frequency';
import type { Point, Window } from './series';
import { daysBetween, mean, median, takeWindow, trendOf } from './series';
import { statusFor } from './status';

interface Baseline {
  value: number | null;
  label?: string;
  heldBack?: string;
}

const HELD_BACK_NOTES: Record<string, string> = {
  noPrePandemicHistory: 'No baseline yet: records start after 2020.',
  seasonal: 'No baseline yet: seasonal service.',
  notComparable: 'No baseline yet: service was counted differently before.',
};

export const baselineFor = (
  baselines: HistoricalBaselines | null,
  metric: BaselineMetric,
  seriesIds: string[]
): Baseline => {
  const series = seriesIds.map((id) => baselines?.metrics[metric]?.series[id]);
  const heldBack = series.find((s) => s?.heldBack)?.heldBack;
  if (heldBack || !series.length || series.some((s) => typeof s?.value !== 'number')) {
    return { value: null, heldBack: heldBack ?? 'none' };
  }
  const value = series.reduce((sum, s) => sum + (s?.value ?? 0), 0);
  const window = seriesIds.length === 1 ? series[0]?.bestWindow : null;
  return {
    value,
    label: window ? dayjs(window.start).format('MMM YYYY') : undefined,
  };
};

const noteForMissingBaseline = (baseline: Baseline) =>
  HELD_BACK_NOTES[baseline.heldBack ?? ''] ?? 'No baseline yet.';

export const naCell = (metric: MetricId, unit: Unit, note: string): Cell => ({
  metric,
  status: 'na',
  score: null,
  value: null,
  unit,
  trend: null,
  notes: [note],
});

interface CellOptions {
  unit: Unit;
  window: Window;
  now: Date;
  /** Raw headline value; defaults to the score. */
  value?: number | null;
  baselineLabel?: string;
  secondary?: string;
  notes?: string[];
  href?: string;
  thresholds?: [number, number, number];
  direction?: 'higher' | 'lower';
  /** Days to add to `asOf` before judging staleness (weekly points are dated by week start). */
  asOfOffsetDays?: number;
  minPoints?: number;
}

export const judgedCell = (metric: MetricId, score: number | null, opts: CellOptions): Cell => {
  const method = METRICS[metric];
  const { window, now } = opts;
  const notes = [...(opts.notes ?? [])];
  const enoughData = window.values.length >= (opts.minPoints ?? MIN_WEEKS);
  const stale =
    !window.asOf || daysBetween(window.asOf, now) - (opts.asOfOffsetDays ?? 6) > method.staleDays;
  if (window.excluded) {
    const weeks = `${window.excluded} week${window.excluded > 1 ? 's' : ''}`;
    notes.push(`Leaves out ${weeks} of shutdowns or holidays.`);
  }
  if (stale && window.asOf)
    notes.push(`Latest data is from ${dayjs(window.asOf).format('MMM D')}.`);
  const status =
    enoughData && !stale
      ? statusFor(score, opts.direction ?? method.direction, opts.thresholds ?? method.thresholds)
      : 'insufficient';
  return {
    metric,
    status,
    score,
    value: opts.value === undefined ? score : opts.value,
    unit: opts.unit,
    baselineLabel: opts.baselineLabel,
    trend: trendOf(window),
    secondary: opts.secondary,
    spark: window.points.map((p) => p.value ?? NaN),
    asOf: window.asOf,
    notes: notes.length ? notes : undefined,
    href: opts.href,
  };
};

/** A weekly series judged against a historical best: `aggregate` over the window ÷ baseline. */
export const ratioCell = (
  metric: MetricId,
  series: Point[],
  baseline: Baseline,
  opts: {
    now: Date;
    aggregate: 'median' | 'mean';
    unit: Unit;
    rawUnitLabel: string;
    href?: string;
    notes?: string[];
    /** Show the raw value (e.g. mph) as the headline instead of the ratio. */
    headlineRaw?: boolean;
  }
): Cell => {
  const window = takeWindow(series);
  const raw = opts.aggregate === 'median' ? median(window.values) : mean(window.values);
  const rawValue = Number.isFinite(raw) ? raw : null;
  const format = (v: number) =>
    v >= 1000 ? Math.round(v).toLocaleString('en-us') : v >= 100 ? Math.round(v) : v.toFixed(1);
  if (baseline.value === null) {
    return {
      ...judgedCell(metric, null, { unit: 'count', window, now: opts.now, href: opts.href }),
      status: 'insufficient',
      value: rawValue,
      unit: 'count',
      unitLabel: opts.rawUnitLabel,
      notes: [
        ...(opts.notes ?? []),
        rawValue === null ? 'No recent data.' : noteForMissingBaseline(baseline),
      ],
    };
  }
  const score = rawValue !== null ? rawValue / baseline.value : null;
  return judgedCell(metric, score, {
    unit: opts.headlineRaw ? opts.unit : 'pct',
    value: opts.headlineRaw ? rawValue : score,
    window,
    now: opts.now,
    href: opts.href,
    notes: opts.notes,
    secondary: rawValue !== null ? `${format(rawValue)} ${opts.rawUnitLabel}` : undefined,
    baselineLabel: `Best: ${format(baseline.value)} ${opts.rawUnitLabel}${
      baseline.label ? ` (${baseline.label})` : ''
    }`,
  });
};

export const tripMetricsSeries = (
  data: DeliveredTripMetrics[] | undefined,
  pick: (d: DeliveredTripMetrics) => number | null | undefined
): Point[] =>
  (data ?? []).map((d) => {
    const value = d.miles_covered ? pick(d) : null;
    return { date: d.date, value: value ?? null };
  });

export const mph = (d: DeliveredTripMetrics) =>
  d.total_time ? d.miles_covered / (d.total_time / 3600) : null;

/** Sum several lines' weekly histories by date, keeping only dates every line has. */
export const sumHistories = (histories: (Record<string, number> | null | undefined)[]): Point[] => {
  const present = histories.filter((h): h is Record<string, number> => Boolean(h));
  if (!present.length) return [];
  const dates = Object.keys(present[0]).filter((date) => present.every((h) => date in h));
  return dates.sort().map((date) => ({
    date,
    value: present.reduce((sum, h) => sum + h[date], 0),
  }));
};

export const frequencyCell = (
  lines: { line: LineData; weight?: number }[],
  goalMinutes: number,
  opts: { now: Date; asOf: string; notes?: string[]; href?: string }
): Cell => {
  const current = combineCoverage(
    lines.map(({ line, weight }) => ({ coverage: goalCoverage(line, goalMinutes), weight }))
  );
  const yearAgo = combineCoverage(
    lines.map(({ line, weight }) => ({
      coverage: goalCoverage(line, goalMinutes, 'oneYearAgo'),
      weight,
    }))
  );
  const window: Window = { points: [], values: [1], excluded: 0, asOf: opts.asOf };
  const cell = judgedCell('frequency', current, {
    unit: 'pct',
    window,
    now: opts.now,
    minPoints: 1,
    asOfOffsetDays: 0,
    href: opts.href,
    notes: opts.notes,
    secondary: `Goal: every ${goalMinutes} min`,
    baselineLabel:
      yearAgo !== null ? `A year ago: ${Math.round(yearAgo * 100)}% of hours` : undefined,
  });
  return {
    ...cell,
    trend: current !== null && yearAgo !== null ? current - yearAgo : null,
    trendBasis: 'yearAgo',
    spark: undefined,
  };
};
