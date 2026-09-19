import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { Period } from './types';

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
