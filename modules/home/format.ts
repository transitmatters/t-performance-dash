import type { Line } from '../../common/types/lines';
import { REASON_BY_KEY, reasonLabel } from '../delays/constants/reasons';
import { NEGLIGIBLE_TREND } from './config';
import type { Cell, Direction, Status, Unit } from './types';

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

// Cut-offs test the rounded figure, so 999.96 reads "1k" rather than "1000".
export const formatNumber = (value: number) =>
  value >= 10_000
    ? `${round(value / 1000)}k`
    : Math.round(value) >= 1000
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
      return Math.round(value) >= 90 ? `${round(value / 60, 1)} min` : `${Math.round(value)} s`;
    case 'minutes':
      return Math.round(value) >= 90
        ? `${round(value / 60, 1)} hr`
        : `${round(value, value < 10 ? 1 : 0)} min`;
    case 'years':
      return `${Math.round(value)} yr`;
    case 'count':
      return formatNumber(value);
  }
};

/** A change as "+6%" or "−4%". */
export const formatChange = (value: number) => {
  const rounded = Math.round(value * 100);
  return rounded > 0 ? `+${rounded}%` : rounded < 0 ? `−${-rounded}%` : '0%';
};

/** The figure shown on a stop; `withUnit` adds the count's label (trips/day) for the detail. */
export const formatCell = (cell: Cell, withUnit = false) => {
  if (cell.status === 'na') return 'n/a';
  // Not enough data to score: a dash on the board, like any other missing figure. The popover
  // still shows what was measured.
  if (cell.status === 'insufficient' && !withUnit) return '—';
  if (cell.value === null || !Number.isFinite(cell.value)) return '—';
  if (cell.metric === 'ridership') return formatChange(cell.value);
  // Dropped trips run well under 10%, where a whole percent hides the difference between lines.
  if (cell.metric === 'dropped' && cell.value < 0.1) return `${round(cell.value * 100, 1)}%`;
  const text = formatValue(cell.value, cell.unit);
  return withUnit && cell.unit === 'count' && cell.unitLabel && text !== '—'
    ? `${text} ${cell.unitLabel}`
    : text;
};

/** "▲ 5% last 2 weeks vs 12", or points when comparing shares a year apart. */
export const formatTrend = (cell: Pick<Cell, 'trend' | 'trendBasis'>) => {
  if (cell.trend === null || cell.trend === undefined || !Number.isFinite(cell.trend)) return null;
  // Shares a year apart (dropped trips) move by fractions of a point.
  const rounded = round(cell.trend * 100, cell.trendBasis === 'yearAgo' ? 1 : 0);
  const arrow = rounded > 0 ? '▲ ' : rounded < 0 ? '▼ ' : '';
  const amount = Math.abs(rounded);
  return cell.trendBasis === 'yearAgo'
    ? `${arrow}${amount} pts vs a year ago`
    : `${arrow}${amount}% last 2 weeks vs 12`;
};

const formatThreshold = (value: number, unit: Unit) =>
  unit === 'pct'
    ? `${Math.round(value * 100)}%`
    : unit === 'seconds'
      ? `${value} s`
      : `${value} yr`;

/** "Win ≥100% · Good ≥92% · Room to grow ≥80%", or undefined for a cell that isn't judged. */
export const formatThresholds = ({
  thresholds,
  direction,
  scoreUnit,
}: Pick<Cell, 'thresholds' | 'direction' | 'scoreUnit'>) => {
  if (!thresholds || !direction || !scoreUnit) return undefined;
  const op = direction === 'higher' ? '≥' : '≤';
  const [win, good, room] = thresholds.map((t) => formatThreshold(t, scoreUnit));
  return `Win ${op}${win} · Good ${op}${good} · Room to grow ${op}${room}`;
};

/** The top delay cause as the Delays page names it, or undefined without one it knows. */
export const topCauseLabel = ({ topCause }: Pick<Cell, 'topCause'>, line: Line) => {
  const reason = topCause && REASON_BY_KEY[topCause.cause];
  return reason ? reasonLabel(reason, line) : undefined;
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
  // Not `text-destructive`: that red falls short of 4.5:1 on the stone ground.
  problem: 'text-red-700 dark:text-red-400',
  insufficient: 'text-muted-foreground',
  na: 'text-muted-foreground',
  unscored: 'text-muted-foreground',
};
