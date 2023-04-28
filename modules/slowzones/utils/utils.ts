import type dayjs from 'dayjs';

export const getTotalSlowTimeGraphUnit = (startDateUTC: dayjs.Dayjs, endDateUTC: dayjs.Dayjs) => {
  const dateRange = endDateUTC.diff(startDateUTC, 'days');
  if (dateRange <= 90) return 'day';
  if (dateRange <= 730) return 'month';
  return 'year';
};
