import { NEGLIGIBLE_TREND } from './config';
import { STATUS_LABELS } from './copy';
import type { Cell, Direction, HeadlineKind, Status, Unit } from './types';

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const formatNumber = (value: number) =>
  value >= 10_000
    ? `${round(value / 1000)}k`
    : value >= 1000
      ? `${round(value / 1000, 1)}k`
      : `${round(value, value >= 100 ? 0 : 1)}`;

export const formatValue = (value: number | null, unit: Unit | 'minutes'): string => {
  if (value === null || !Number.isFinite(value)) return '—';
  switch (unit) {
    case 'pct':
      return `${Math.round(value * 100)}%`;
    case 'mph':
      return `${round(value, 1)} mph`;
    case 'seconds':
      return value >= 90 ? `${round(value / 60, 1)} min` : `${Math.round(value)} s`;
    case 'minutes':
      return value >= 90 ? `${round(value / 60, 1)} hr` : `${round(value, value < 10 ? 1 : 0)} min`;
    case 'years':
      return `${Math.round(value)} yr`;
    case 'count':
      return formatNumber(value);
  }
};

/** The figure shown on a stop; `withUnit` adds the count's label (trips/day) for the detail. */
export const formatCell = (cell: Cell, withUnit = false) => {
  if (cell.status === 'na') return 'n/a';
  const text = formatValue(cell.value, cell.unit);
  return withUnit && cell.unit === 'count' && cell.unitLabel && text !== '—'
    ? `${text} ${cell.unitLabel}`
    : text;
};

/** "▲ 5% vs 12 weeks", or points when comparing shares a year apart. */
export const formatTrend = (cell: Pick<Cell, 'trend' | 'trendBasis'>) => {
  if (cell.trend === null || !Number.isFinite(cell.trend)) return null;
  const amount = Math.abs(Math.round(cell.trend * 100));
  // From the rounded amount, so a change too small to show doesn't get an arrow ("▼ 0%").
  const arrow = amount === 0 ? '' : cell.trend > 0 ? '▲' : '▼';
  return cell.trendBasis === 'yearAgo'
    ? `${arrow} ${amount} pts vs a year ago`.trim()
    : `${arrow} ${amount}% last 2 weeks vs 12`.trim();
};

const formatThreshold = (value: number, unit: Unit) =>
  unit === 'pct'
    ? `${Math.round(value * 100)}%`
    : unit === 'seconds'
      ? `${value} s`
      : `${value} yr`;

/** "Strong ≥100% · Good ≥92% · Room to grow ≥80%", or undefined for a cell that isn't judged. */
export const formatThresholds = ({
  thresholds,
  direction,
  scoreUnit,
}: Pick<Cell, 'thresholds' | 'direction' | 'scoreUnit'>) => {
  if (!thresholds || !direction || !scoreUnit) return undefined;
  const op = direction === 'higher' ? '≥' : '≤';
  const [win, good, room] = thresholds.map((t) => formatThreshold(t, scoreUnit));
  return `${STATUS_LABELS.win} ${op}${win} · ${STATUS_LABELS.good} ${op}${good} · ${STATUS_LABELS.room} ${op}${room}`;
};

export type TrendSentiment = 'good' | 'bad' | 'flat';

export const trendSentiment = (trend: number | null, direction: Direction): TrendSentiment => {
  if (trend === null || Math.abs(trend) < NEGLIGIBLE_TREND) return 'flat';
  return trend > 0 === (direction === 'higher') ? 'good' : 'bad';
};

export const STATUS_TONE: Record<Status, string> = {
  win: 'text-green-700 dark:text-green-400',
  good: 'text-green-700 dark:text-green-400',
  room: 'text-amber-700 dark:text-amber-400',
  problem: 'text-destructive',
  insufficient: 'text-muted-foreground',
  na: 'text-muted-foreground',
};

/**
 * The color of a stop, by status rather than by line, so red always means "needs work" and green
 * always means "good". The line's own color stays on its bullet and track. Each is at least 3:1
 * against the page, as a graphic needs.
 */
export const STATUS_NODE_TONE: Record<Status, string> = {
  win: 'text-green-600 dark:text-green-500',
  good: 'text-green-600 dark:text-green-500',
  room: 'text-amber-600 dark:text-amber-500',
  problem: 'text-red-600 dark:text-red-500',
  insufficient: 'text-muted-foreground',
  na: 'text-muted-foreground',
};

export const HEADLINE_TONE: Record<HeadlineKind, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  room: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  needsWork: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  limited: 'border-border text-muted-foreground',
};
