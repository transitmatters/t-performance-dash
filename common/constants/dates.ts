import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { DateTimePickerProps } from 'react-flatpickr';
import type {
  DateParams,
  DateSelectionDefaultOptions,
  SingleDateParams,
} from '../components/inputs/DateSelection/types/DateSelectionTypes';
import type { Tab } from './dashboardTabs';
dayjs.extend(utc);
dayjs.extend(timezone);

const est = 'America/New_York';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const PRETTY_DATE_FORMAT = 'MMM D, YYYY';
export const SMALL_DATE_FORMAT = 'M/D/YY';
export const TODAY = dayjs().tz(est);
export const TODAY_MIDNIGHT = dayjs().startOf('day');
export const YESTERDAY_MIDNIGHT = TODAY_MIDNIGHT.subtract(1, 'day');
export const TODAY_STRING = TODAY.format(DATE_FORMAT);
export const YESTERDAY_STRING = TODAY.subtract(1, 'day').format(DATE_FORMAT);
export const TODAY_SERVICE_STARTED = TODAY.hour() >= 6;
export const RANGE_OPTIONS = ['Single Day', 'Range'];
export const ONE_WEEK_AGO = TODAY.subtract(7, 'days');
export const ONE_WEEK_AGO_STRING = ONE_WEEK_AGO.format(DATE_FORMAT);
export const ONE_YEAR_AGO = TODAY.subtract(1, 'year');
export const ONE_YEAR_AGO_STRING = ONE_YEAR_AGO.format(DATE_FORMAT);
export const THREE_MONTHS_AGO = TODAY.subtract(90, 'days');
export const THREE_MONTHS_AGO_STRING = TODAY.subtract(90, 'days').format(DATE_FORMAT);

const OVERVIEW_TRAIN_MIN_DATE = '2016-02-01';
const TRAIN_MIN_DATE = '2016-01-15';
const BUS_MIN_DATE = '2018-08-01';
export const BUS_MAX_DATE = '2023-01-31';
export const BUS_MAX_DATE_MINUS_ONE_WEEK = dayjs(BUS_MAX_DATE)
  .subtract(7, 'days')
  .format(DATE_FORMAT);

export const FLAT_PICKER_OPTIONS: {
  [key in Tab]: DateTimePickerProps['options'];
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
  System: {
    enableTime: false,
    minDate: TRAIN_MIN_DATE,
    maxDate: TODAY_STRING,
    altInput: true,
    altFormat: 'M j, Y',
    dateFormat: 'Y-m-d',
  },
};

export const SINGLE_PRESETS: {
  [key in DatePresetKey]?: DateSelectionDefaultOptions<SingleDateParams>;
} = {
  today: { key: 'today', name: 'Today', input: { date: TODAY_STRING } },
  yesterday: {
    key: 'yesterday',
    name: 'Yesterday',
    input: { date: TODAY.subtract(1, 'day').format(DATE_FORMAT) },
  },
  week: {
    key: 'week',
    name: `Last ${TODAY.subtract(7, 'days').format('dddd')}`,
    input: {
      date: TODAY.subtract(7, 'days').format(DATE_FORMAT),
    },
  },
  month: {
    key: 'month',
    name: `30 days ago`,
    input: {
      date: TODAY.subtract(30, 'days').format(DATE_FORMAT),
    },
  },
  year: {
    key: 'year',
    name: `One year ago`,
    input: {
      date: ONE_YEAR_AGO_STRING,
    },
  },
};

// TODO Different presets for buses
export const RANGE_PRESETS: { [key in DatePresetKey]?: DateSelectionDefaultOptions<DateParams> } = {
  week: {
    key: 'week',
    name: 'Past week',
    input: {
      startDate: TODAY.subtract(7, 'days').format(DATE_FORMAT),
      endDate: TODAY_STRING,
    },
  },
  month: {
    key: 'month',

    name: 'Past month',
    input: {
      startDate: TODAY.subtract(31, 'days').format(DATE_FORMAT),
      endDate: TODAY_STRING,
    },
  },
  thisMonth: {
    key: 'thisMonth',

    name: TODAY.format('MMMM YYYY'),
    input: {
      startDate: TODAY.startOf('month').format(DATE_FORMAT),
      endDate: TODAY_STRING,
    },
  },
  lastMonth: {
    key: 'lastMonth',

    name: TODAY.subtract(1, 'month').format('MMMM YYYY'),
    input: {
      startDate: TODAY.subtract(1, 'month').startOf('month').format(DATE_FORMAT),
      endDate: TODAY.subtract(1, 'month').endOf('month').format(DATE_FORMAT),
    },
  },
  year: {
    key: 'year',
    name: 'Past year',
    input: {
      startDate: ONE_YEAR_AGO_STRING,
      endDate: TODAY_STRING,
    },
  },
  thisYear: {
    key: 'thisYear',
    name: TODAY.format('YYYY'),
    input: {
      startDate: TODAY.startOf('year').format(DATE_FORMAT),
      endDate: TODAY_STRING,
    },
  },
  lastYear: {
    key: 'lastYear',
    name: TODAY.subtract(1, 'year').format('YYYY'),
    input: {
      startDate: TODAY.startOf('year').subtract(1, 'year').format(DATE_FORMAT),
      endDate: TODAY.endOf('year').subtract(1, 'year').format(DATE_FORMAT),
    },
  },

  all: {
    key: 'all',
    name: 'All time',
    input: {
      startDate: dayjs(OVERVIEW_TRAIN_MIN_DATE).format(DATE_FORMAT),
      endDate: TODAY_STRING,
    },
  },
};

export type DatePresetKey =
  | OverviewDatePresetKey
  | 'today'
  | 'lastYear'
  | 'thisYear'
  | 'lastMonth'
  | 'thisMonth'
  | 'yesterday';

export type AggregationTypes = 'daily' | 'weekly' | 'monthly';

// TODO: can probably consolidate this with the RANGE_PRESETS object.
export const OVERVIEW_OPTIONS: {
  [key in OverviewDatePresetKey]: { startDate: string; agg: AggregationTypes };
} = {
  week: {
    startDate: TODAY.subtract(7, 'days').format(DATE_FORMAT),
    agg: 'daily',
  },
  month: {
    startDate: TODAY.subtract(31, 'days').format(DATE_FORMAT),
    agg: 'daily',
  },
  year: {
    startDate: TODAY.subtract(365, 'days').format(DATE_FORMAT),
    agg: 'weekly',
  },

  all: {
    startDate: dayjs(OVERVIEW_TRAIN_MIN_DATE).format(DATE_FORMAT),
    agg: 'monthly',
  },
};

export type OverviewDatePresetKey = keyof typeof OverviewRangeTypes;

export enum OverviewRangeTypes {
  'week' = 'Past week',
  'month' = 'Past month',
  'year' = 'Past year',
  'all' = 'All time',
}

export const RANGE_DATE_KEYS = Object.fromEntries(
  Object.values(RANGE_PRESETS).map((rangePreset) => [
    `${rangePreset.input.startDate}${rangePreset.input.endDate}`,
    rangePreset.key,
  ])
);
export const SINGLE_DATE_KEYS = Object.fromEntries(
  Object.values(SINGLE_PRESETS).map((singlePreset) => [singlePreset.input.date, singlePreset.key])
);

export const todayOrDate = (date: dayjs.Dayjs) => {
  return date.isSame(TODAY, 'day') ? 'Today' : date.format(PRETTY_DATE_FORMAT);
};
