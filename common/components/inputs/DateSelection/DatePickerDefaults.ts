import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
const est = 'America/New_York';

dayjs.extend(utc);
dayjs.extend(timezone);
const dateFormat = 'YYYY-MM-DD';

export const TODAY = dayjs().tz(est);
export const TODAY_STRING = TODAY.format(dateFormat);
export const RANGE_OPTIONS = ['Single Day', 'Range'];
export const DATE_PICKER_OPTIONS = {
  singleDay: [
    { name: 'Today', input: { startDate: TODAY_STRING } },
    { name: 'Yesterday', input: { startDate: TODAY.subtract(1, 'day').format(dateFormat) } },
    {
      name: `Last ${TODAY.subtract(7, 'days').format('dddd')}`,
      input: {
        startDate: TODAY.subtract(7, 'days').format(dateFormat),
      },
    },
    {
      name: `One year ago`,
      input: {
        startDate: TODAY.subtract(1, 'year').format(dateFormat),
      },
    },
  ],
  range: [
    {
      name: 'Past week',
      input: {
        startDate: TODAY.subtract(7, 'days').format(dateFormat),
        endDate: TODAY_STRING,
      },
    },

    {
      name: 'Past 30 days',
      input: {
        startDate: TODAY.subtract(30, 'days').format(dateFormat),
        endDate: TODAY_STRING,
      },
    },
    {
      name: TODAY.format('MMMM YYYY'),
      input: {
        startDate: TODAY.startOf('month').format(dateFormat),
        endDate: TODAY_STRING,
      },
    },
    {
      name: TODAY.subtract(1, 'month').format('MMMM YYYY'),
      input: {
        startDate: TODAY.subtract(1, 'month').startOf('month').format(dateFormat),
        endDate: TODAY.subtract(1, 'month').endOf('month').format(dateFormat),
      },
    },
  ],
};
