import dayjs from 'dayjs';
import { DATE_FORMAT } from '../constants/dates';

export const prettyDate = (dateString: string, withDow: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: withDow ? 'long' : undefined,
  };

  const fullDate = dateString.includes('T')
    ? dateString
    : /* Offset so that it's always past midnight in Boston */ `${dateString}T07:00:00`;

  return new Date(fullDate).toLocaleDateString(
    undefined, // user locale/language
    options
  );
};

export const getCurrentDate = (): string => {
  const isoDate = new Date();
  const offset = isoDate.getTimezoneOffset();
  const localDate = new Date(isoDate.valueOf() - offset * 60 * 1000);
  const maxDate = localDate.toISOString().split('T')[0];
  return maxDate;
};

// Weekly data is keyed on the Monday of each week. Start from the Monday of the start
// date's week so a range that begins mid-week still includes that week.
export const getWeekStart = (date: string) => {
  const day = dayjs(date);
  return day.subtract((day.day() + 6) % 7, 'day').format(DATE_FORMAT);
};

export const withWeekStart = <T extends { start_date?: string; agg?: string }>(options: T): T =>
  options.agg === 'weekly' && options.start_date
    ? { ...options, start_date: getWeekStart(options.start_date) }
    : options;
