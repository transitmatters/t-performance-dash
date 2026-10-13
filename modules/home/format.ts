import type { MetricMethod } from './config';
import type { Cell, Status, Unit } from './types';

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
  const arrow = cell.trend > 0 ? '▲' : cell.trend < 0 ? '▼' : '';
  const amount = Math.abs(Math.round(cell.trend * 100));
  return cell.trendBasis === 'yearAgo'
    ? `${arrow} ${amount} pts vs a year ago`
    : `${arrow} ${amount}% last 2 weeks vs 12`;
};

const formatThreshold = (value: number, unit: Unit) =>
  unit === 'pct'
    ? `${Math.round(value * 100)}%`
    : unit === 'seconds'
      ? `${value} s`
      : `${value} yr`;

export const formatThresholds = (
  method: MetricMethod,
  thresholds = method.thresholds,
  direction = method.direction,
  unit = method.scoreUnit
) => {
  const op = direction === 'higher' ? '≥' : '≤';
  const [win, good, room] = thresholds.map((t) => formatThreshold(t, unit));
  return `Win ${op}${win} · Good ${op}${good} · Room to grow ${op}${room}`;
};

export const STATUS_TONE: Record<Status, string> = {
  win: 'text-green-700 dark:text-green-400',
  good: 'text-green-700 dark:text-green-400',
  room: 'text-amber-700 dark:text-amber-400',
  problem: 'text-destructive',
  insufficient: 'text-muted-foreground',
  na: 'text-muted-foreground',
};
