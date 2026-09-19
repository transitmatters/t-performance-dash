import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type {
  BusSpeedSegmentLeaderboardByBand,
  BusSpeedSegmentLeaderboardByDayType,
  BusSpeedSegmentLeaderboardEntry,
  BusSpeedSegmentLeaderboardResponse,
  DayType,
  Period,
  TimeBand,
} from './types';

dayjs.extend(isoWeek);

/**
 * The single-date picker (shared with the trips pages via dateStoreSection: 'singleTrips')
 * stays the only date control -- weekly/monthly just reinterpret whichever date is already
 * selected as "the week/month containing this date", rather than adding a second picker UI.
 * Undefined for 'daily': the date itself already says which day it is.
 */
export const periodLabel = (date: string | undefined, period: Period): string | undefined => {
  if (!date || period === 'daily') return undefined;
  const day = dayjs(date);
  if (period === 'monthly') return day.format('MMMM YYYY');
  const start = day.startOf('isoWeek');
  const end = day.endOf('isoWeek');
  const endFormat = start.isSame(end, 'month') ? 'D, YYYY' : 'MMM D, YYYY';
  return `Week of ${start.format('MMM D')} – ${end.format(endFormat)}`;
};

/** The current, still-accumulating week/month has a tile too, built from partial data. */
export const isPeriodInProgress = (date: string | undefined, period: Period): boolean => {
  if (!date || period === 'daily') return false;
  const day = dayjs(date);
  const periodEnd = period === 'monthly' ? day.endOf('month') : day.endOf('isoWeek');
  return periodEnd.isAfter(dayjs());
};

/**
 * The route leaderboard's API takes an arbitrary [start_date, end_date] range; the merged
 * leaderboard page derives one from the single selected date the same way the segment
 * leaderboard's file layout already carves up service -- a calendar day, an ISO week
 * (Monday-start), or a calendar month. A still-in-progress week/month is capped at today
 * rather than requesting into the future, matching the "figures reflect service so far" note
 * shown alongside it.
 */
export const periodDateRange = (
  date: string,
  period: Period
): { start_date: string; end_date: string } => {
  const format = 'YYYY-MM-DD';
  if (period === 'daily') return { start_date: date, end_date: date };

  const day = dayjs(date);
  const start = period === 'monthly' ? day.startOf('month') : day.startOf('isoWeek');
  const naturalEnd = period === 'monthly' ? day.endOf('month') : day.endOf('isoWeek');
  const today = dayjs();
  const end = naturalEnd.isAfter(today) ? today : naturalEnd;
  return { start_date: start.format(format), end_date: end.format(format) };
};

/**
 * Daily files are keyed straight by time_band; weekly/monthly nest one level deeper by
 * day_type first. Normalizing that shape difference here means the leaderboard UI can always
 * ask for "this band" without branching on period itself -- a missing key (an empty band, or
 * a still-in-progress period missing a day_type entirely) just reads back as an empty list.
 */
export const selectSegmentLeaderboardEntries = (
  data: BusSpeedSegmentLeaderboardResponse,
  period: Period,
  dayType: DayType,
  timeBand: TimeBand
): BusSpeedSegmentLeaderboardEntry[] => {
  if (period === 'daily') {
    return (data as BusSpeedSegmentLeaderboardByBand)[timeBand] ?? [];
  }
  return (data as BusSpeedSegmentLeaderboardByDayType)[dayType]?.[timeBand] ?? [];
};
