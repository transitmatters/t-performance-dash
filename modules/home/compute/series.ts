import { NEGLIGIBLE_TREND, WINDOW_WEEKS } from '../config';
import type { Direction } from '../types';

export interface Point {
  date: string;
  value: number | null;
}

export const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

export const median = (values: number[]) => {
  if (!values.length) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const fromRecord = (record: Record<string, number> | null | undefined): Point[] =>
  Object.entries(record ?? {})
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

export interface Window {
  points: Point[];
  values: number[];
  /** Weeks dropped as planned work (a shutdown or diversion), not counted against the line. */
  excluded: number;
  asOf?: string;
}

/**
 * The last WINDOW_WEEKS points, without gaps and with up to 3 planned-work weeks (under 60% of the
 * window median) left out. Those weeks show a shutdown, not how the line normally runs.
 */
export const takeWindow = (series: Point[], dropLowWeeks = true): Window => {
  const points = series.slice(-WINDOW_WEEKS);
  const present = points.filter((p): p is { date: string; value: number } =>
    Number.isFinite(p.value)
  );
  const mid = median(present.map((p) => p.value));
  const low = dropLowWeeks
    ? present
        .filter((p) => p.value < 0.6 * mid)
        .sort((a, b) => a.value - b.value)
        .slice(0, 3)
    : [];
  const kept = present.filter((p) => !low.includes(p));
  return {
    points,
    values: kept.map((p) => p.value),
    excluded: low.length,
    asOf: present.at(-1)?.date,
  };
};

/** Last 2 weeks vs the whole window, as a fraction. */
export const trendOf = (window: Window): number | null => {
  const recent = window.values.slice(-2);
  if (recent.length < 2 || window.values.length < 4) return null;
  const base = mean(window.values);
  return base ? mean(recent) / base - 1 : null;
};

export type TrendSentiment = 'good' | 'bad' | 'flat';

export const trendSentiment = (trend: number | null, direction: Direction): TrendSentiment => {
  if (trend === null || Math.abs(trend) < NEGLIGIBLE_TREND) return 'flat';
  return trend > 0 === (direction === 'higher') ? 'good' : 'bad';
};

export const daysBetween = (from: string, to: Date) =>
  (to.getTime() - new Date(from).getTime()) / 86_400_000;
