import type { TooltipCallbacks, TooltipItem, TooltipModel } from 'chart.js';
import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../../common/constants/dates';

const today = dayjs();
const endDate = today.format(DATE_FORMAT);

type ParamsType = {
  agg: 'daily' | 'weekly' | 'monthly';
  endDate: string;
  startDate: string;
  comparisonStartDate: string;
  comparisonEndDate: string;
  tooltipFormat: 'MMM d, yyyy' | 'MMM yyyy';
  unit: 'day' | 'month' | 'year';
  callbacks?:
    | _DeepPartialObject<TooltipCallbacks<'line', TooltipModel<'line'>, TooltipItem<'line'>>>
    | undefined;
};

export const DELAYS_RANGE_PARAMS_MAP: { [s: string]: ParamsType } = {
  week: {
    agg: 'daily',
    endDate: endDate,
    startDate: today.subtract(6, 'days').format(DATE_FORMAT),
    comparisonStartDate: today.subtract(13, 'days').format(DATE_FORMAT),
    comparisonEndDate: today.subtract(6, 'days').subtract(1, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',
    unit: 'day',
  },
  month: {
    agg: 'daily',
    endDate: endDate,
    startDate: today.subtract(30, 'days').format(DATE_FORMAT),
    comparisonStartDate: today.subtract(60, 'days').format(DATE_FORMAT),
    comparisonEndDate: today.subtract(30, 'days').subtract(1, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',

    unit: 'day',
  },
  year: {
    agg: 'weekly',
    endDate: endDate,
    startDate: today.subtract(1, 'years').format(DATE_FORMAT),
    comparisonStartDate: today.subtract(2, 'years').format(DATE_FORMAT),
    comparisonEndDate: today.subtract(1, 'years').subtract(1, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',
    callbacks: {
      title: (context) => `Week of ${context[0].label}`,
    },
    unit: 'month',
  },
  all: {
    agg: 'monthly',
    endDate: endDate,
    startDate: dayjs('2016-01-01').format(DATE_FORMAT),
    comparisonStartDate: today.subtract(2, 'years').format(DATE_FORMAT), // TODO: better comparison for all times (?)
    comparisonEndDate: today.subtract(1, 'years').subtract(1, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM yyyy',
    unit: 'year',
  },
};

// TODO: Upload this to overviewStats db
export const MINIMUMS = {
  'line-red': { date: 'May 2020', value: 8374.5 },
  'line-blue': { date: 'May 2020', value: 1860.5 },
  'line-orange': { date: 'May 2020', value: 3776.75 },
  DEFAULT: { date: '', value: 1 },
};

// As per MBTA Blue book: https://archives.lib.state.ma.us/handle/2452/827917 2003-2004
export const CORE_TRACK_LENGTHS = {
  'line-red': 14.82 + 14.82 + 10.13 + 10.13, // <Quincy Adams -> Davis> + <reverse> + <Shawmut -> Davis> + <reverse>
  'line-orange': 9.64 + 9.58, // <Malden Station -> Green Street> + <reverse>
  'line-blue': 5.38 + 5.37, //<Gov. Center -> Revere> + <reverse>
  DEFAULT: 1,
};

export const PEAK_MPH = {
  'line-red': CORE_TRACK_LENGTHS['line-red'] / (MINIMUMS['line-red'].value / 3600),
  'line-orange': CORE_TRACK_LENGTHS['line-orange'] / (MINIMUMS['line-orange'].value / 3600),
  'line-blue': CORE_TRACK_LENGTHS['line-blue'] / (MINIMUMS['line-blue'].value / 3600),
  DEFAULT: 1,
};
