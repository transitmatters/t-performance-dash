import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { DateSelectionDefaultOptions } from './types/DateSelectionTypes';
const est = 'America/New_York';

dayjs.extend(utc);
dayjs.extend(timezone);
export const DATE_FORMAT = 'YYYY-MM-DD';

export const TODAY = dayjs().tz(est);
export const TODAY_STRING = TODAY.format(DATE_FORMAT);
export const RANGE_OPTIONS = ['Single Day', 'Range'];

export const FLAT_PICKER_OPTIONS = {
  enableTime: false,
  minDate: '2016-01-15',
  maxDate: TODAY_STRING,
  altInput: true,
  altFormat: 'M j, Y',
  dateFormat: 'Y-m-d',
};

export const DATE_PICKER_PRESETS: { [key: string]: DateSelectionDefaultOptions[] } = {
  singleDay: [
    { name: 'Today', input: { startDate: TODAY_STRING } },
    { name: 'Yesterday', input: { startDate: TODAY.subtract(1, 'day').format(DATE_FORMAT) } },
    {
      name: `Last ${TODAY.subtract(7, 'days').format('dddd')}`,
      input: {
        startDate: TODAY.subtract(7, 'days').format(DATE_FORMAT),
      },
    },
    {
      name: `One year ago`,
      input: {
        startDate: TODAY.subtract(1, 'year').format(DATE_FORMAT),
      },
    },
  ],
  range: [
    {
      name: 'Past week',
      input: {
        startDate: TODAY.subtract(7, 'days').format(DATE_FORMAT),
        endDate: TODAY_STRING,
      },
    },

    {
      name: 'Past 30 days',
      input: {
        startDate: TODAY.subtract(30, 'days').format(DATE_FORMAT),
        endDate: TODAY_STRING,
      },
    },
    {
      name: TODAY.format('MMMM YYYY'),
      input: {
        startDate: TODAY.startOf('month').format(DATE_FORMAT),
        endDate: TODAY_STRING,
      },
    },
    {
      name: TODAY.subtract(1, 'month').format('MMMM YYYY'),
      input: {
        startDate: TODAY.subtract(1, 'month').startOf('month').format(DATE_FORMAT),
        endDate: TODAY.subtract(1, 'month').endOf('month').format(DATE_FORMAT),
      },
    },
  ],
};
