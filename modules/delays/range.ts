import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../common/constants/dates';
import { getWeekStart } from '../../common/utils/date';
import type { DelayRow } from './reasonSeries';
import { withinRange } from './reasonSeries';

/** From and to, YYYY-MM-DD, inclusive. */
export type DateSpan = [string, string];

/** A row and how many of the selected days it covers: 7 for a week, 1 for a day. */
export type RangeRow = DelayRow & { days: number };

/** Which part of the selected dates weekly rows cover, and which parts need daily rows. */
export interface WeekSplit {
  weeks?: DateSpan;
  head?: DateSpan;
  tail?: DateSpan;
}

const addDays = (date: string, days: number) => dayjs(date).add(days, 'day').format(DATE_FORMAT);

/**
 * Weekly rows run from Monday to Sunday, so over start..end they'd add days from outside it at
 * either end. They're only used for the whole weeks inside it; the days before the first of those
 * and after the last are summed from daily rows instead.
 *
 * The weekly table is rebuilt on Monday and Tuesday mornings only, so its row for the week in
 * progress stops at Monday or Tuesday, and last week's row isn't finished until Monday's rebuild.
 * A week only counts as whole once it ended at least two days ago.
 */
export const splitByWeek = (start: string, end: string, today: string): WeekSplit => {
  const startMonday = getWeekStart(start);
  const firstMonday = startMonday < start ? addDays(startMonday, 7) : startMonday;
  const settled = addDays(today, -2);
  const lastDay = end < settled ? end : settled;
  // The Sunday on or before lastDay
  const lastSunday = addDays(getWeekStart(addDays(lastDay, 1)), -1);

  if (firstMonday > lastSunday) return { head: [start, end] };
  return {
    weeks: [firstMonday, lastSunday],
    head: start < firstMonday ? [start, addDays(firstMonday, -1)] : undefined,
    tail: lastSunday < end ? [addDays(lastSunday, 1), end] : undefined,
  };
};

/** The rows that add up to exactly the selected dates, in date order. */
export const coverRange = (split: WeekSplit, weeks: DelayRow[], days: DelayRow[]): RangeRow[] => {
  const dailyRows = (span?: DateSpan) =>
    span ? withinRange(days, ...span).map((row) => ({ ...row, days: 1 })) : [];
  return [
    ...dailyRows(split.head),
    ...(split.weeks ? withinRange(weeks, ...split.weeks).map((row) => ({ ...row, days: 7 })) : []),
    ...dailyRows(split.tail),
  ];
};
