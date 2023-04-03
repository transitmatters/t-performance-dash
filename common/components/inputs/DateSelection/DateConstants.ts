import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { DateTimePickerProps } from 'react-flatpickr';
import type { Tab } from '../../../types/router';
import type { DateSelectionDefaultOptions } from './types/DateSelectionTypes';
const est = 'America/New_York';

dayjs.extend(utc);
dayjs.extend(timezone);
export const DATE_FORMAT = 'YYYY-MM-DD';

export const TODAY = dayjs().tz(est);
export const TODAY_STRING = TODAY.format(DATE_FORMAT);
export const RANGE_OPTIONS = ['Single Day', 'Range'];

const TRAIN_MIN_DATE = '2016-01-15';
const BUS_MIN_DATE = '2018-08-01';
const BUS_MAX_DATE = '2022-12-31';

export const FLAT_PICKER_OPTIONS: {
  [key in Exclude<Tab, ''>]: DateTimePickerProps['options'];
} = {
  Subway: {
    enableTime: false,
    minDate: TRAIN_MIN_DATE,
    maxDate: TODAY_STRING,
    altInput: true,
    altFormat: 'M j, Y',
    dateFormat: 'Y-m-d',
  },
  Bus: {
    enableTime: false,
    minDate: BUS_MIN_DATE,
    maxDate: BUS_MAX_DATE,
    altInput: true,
    altFormat: 'M j, Y',
    dateFormat: 'Y-m-d',
  },
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
