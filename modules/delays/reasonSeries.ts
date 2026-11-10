import dayjs from 'dayjs';
import type { LineDelays } from '../../common/types/delays';
import type { Line } from '../../common/types/lines';
import type { DelayReasonKey } from './constants/reasons';
import { DELAY_REASONS, reasonLabel } from './constants/reasons';

export interface ReasonSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  total: number;
}

export const reasonTotals = (data: LineDelays[]): Record<DelayReasonKey, number> =>
  Object.fromEntries(
    DELAY_REASONS.map(({ key }) => [key, data.reduce((sum, point) => sum + point[key], 0)])
  ) as Record<DelayReasonKey, number>;

export const rankReasons = (totals: Record<DelayReasonKey, number>, line?: Line) =>
  DELAY_REASONS.filter((reason) => totals[reason.key] > 0)
    .sort((a, b) => totals[b.key] - totals[a.key])
    .map((reason) => ({ ...reason, label: reasonLabel(reason, line) }));

export const buildSeries = (data: LineDelays[], line?: Line): ReasonSeries[] => {
  const totals = reasonTotals(data);
  return rankReasons(totals, line).map(({ key, label, color }) => ({
    id: key,
    label,
    color,
    values: data.map((point) => point[key]),
    total: totals[key],
  }));
};

/** Sum of every reason in one period: the denominator for share views. */
export const periodTotals = (data: LineDelays[]): number[] =>
  data.map((point) => DELAY_REASONS.reduce((sum, { key }) => sum + point[key], 0));

/**
 * A period with a trivial amount of delay would otherwise be drawn as tall as a period with a huge
 * one once everything is normalised to 100%. Shares are only shown for periods with at least this
 * many minutes: a twentieth of the median busy period.
 */
export const minShareMinutes = (totals: number[]): number => medianPeriodTotal(totals) * 0.05;

/** The median of periods that had any delay at all: what a normal day or week looks like. */
export const medianPeriodTotal = (totals: number[]): number => {
  const busy = totals.filter((total) => total > 0).sort((a, b) => a - b);
  return busy.length ? busy[Math.floor(busy.length / 2)] : 0;
};

export interface CauseRow {
  key: DelayReasonKey;
  label: string;
  color: string;
  total: number;
  share: number;
}

/** Every cause that occurred in the range, biggest first, with its share of all delay time. */
export const causeRows = (data: LineDelays[], line?: Line): CauseRow[] => {
  const totals = reasonTotals(data);
  const ranked = rankReasons(totals, line);
  const grand = ranked.reduce((sum, reason) => sum + totals[reason.key], 0);
  if (!grand) return [];
  return ranked.map(({ key, label, color }) => ({
    key,
    label,
    color,
    total: totals[key],
    share: totals[key] / grand,
  }));
};

/** A day or week as the page plots it, with the delay its alerts announced kept for comparison. */
export type DelayRow = LineDelays & {
  stated_delay_time: number;
  stated_by_cause: Record<DelayReasonKey, number>;
};

const statedByCause = (row: LineDelays) =>
  Object.fromEntries(DELAY_REASONS.map(({ key }) => [key, row[key]])) as Record<
    DelayReasonKey,
    number
  >;

/**
 * Use the actual delay (how long delay alerts were up) wherever the API has it: subway lines and bus
 * routes with alert history. Commuter Rail alerts state how far behind schedule a train is, which
 * already is its delay, so those rows keep the stated delay. Rows missing the actual delay (e.g.
 * today, before alert history is in) are dropped rather than mixing in the stated number.
 */
export const toActualDelays = (data: LineDelays[]) => {
  const isActual = data.some((row) => row.delay_alert_minutes != null);
  const rows: DelayRow[] = data.flatMap((row) => {
    if (!isActual) {
      return [
        { ...row, stated_delay_time: row.total_delay_time, stated_by_cause: statedByCause(row) },
      ];
    }
    if (row.delay_alert_minutes == null) return [];
    return [
      {
        ...row,
        total_delay_time: row.delay_alert_minutes,
        stated_delay_time: row.total_delay_time,
        stated_by_cause: statedByCause(row),
        ...Object.fromEntries(
          DELAY_REASONS.map(({ key }) => [key, row[`delay_alert_minutes_${key}`] ?? 0])
        ),
      },
    ];
  });
  return { rows, isActual };
};

/**
 * Only the periods inside the requested dates (YYYY-MM-DD, inclusive). The time charts already clip
 * to the range through their axes, but totals and rankings sum every row they're given; if the API
 * returns extra periods (the static dev backend ignores dates entirely), they'd disagree.
 */
export const withinRange = <T extends LineDelays>(data: T[], start: string, end: string): T[] =>
  data.filter((point) => point.date >= start && point.date <= end);

const DAYS_PER_WEEK = 7;

/** Every numeric field of the rows, each scaled by its share before adding up. */
const weightedSum = (parts: [DelayRow, number][]): Record<string, unknown> => {
  const keys = new Set(parts.flatMap(([row]) => Object.keys(row)));
  const sum: Record<string, unknown> = {};
  for (const key of keys) {
    const values = parts.map(([row, share]) => [row[key as keyof DelayRow], share] as const);
    if (values.every(([value]) => typeof value !== 'number')) continue;
    sum[key] = values.reduce(
      (total, [value, share]) => total + (typeof value === 'number' ? value * share : 0),
      0
    );
  }
  return sum;
};

/**
 * Weekly rows as calendar months. Each week's delay is split evenly over its seven days, so a month
 * with five Mondays doesn't read 25% worse than one with four. Only months the weeks fully cover are
 * kept: a partial first or current month would look like a quiet one.
 */
export const toMonthly = (weeks: DelayRow[]): DelayRow[] => {
  const months = new Map<string, { days: number; parts: Map<DelayRow, number> }>();
  for (const week of weeks) {
    for (let offset = 0; offset < DAYS_PER_WEEK; offset++) {
      const month = dayjs(week.date).add(offset, 'day').format('YYYY-MM');
      const entry = months.get(month) ?? { days: 0, parts: new Map() };
      entry.days += 1;
      entry.parts.set(week, (entry.parts.get(week) ?? 0) + 1 / DAYS_PER_WEEK);
      months.set(month, entry);
    }
  }
  return [...months.entries()]
    .filter(([month, { days }]) => days === dayjs(`${month}-01`).daysInMonth())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { parts }]) => {
      const entries = [...parts.entries()];
      const [first] = entries[0];
      const statedByCause = Object.fromEntries(
        DELAY_REASONS.map(({ key }) => [
          key,
          entries.reduce((total, [row, share]) => total + row.stated_by_cause[key] * share, 0),
        ])
      ) as Record<DelayReasonKey, number>;
      return {
        ...first,
        ...weightedSum(entries),
        date: `${month}-01`,
        stated_by_cause: statedByCause,
      };
    });
};
