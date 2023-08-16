import type { TooltipCallbacks, TooltipItem, TooltipModel } from 'chart.js';
import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
import dayjs from 'dayjs';
import { todayOrDate } from '../../../common/constants/dates';

export type AggType = 'daily' | 'weekly' | 'monthly';
export type ParamsType = {
  agg: AggType;
  tooltipFormat: 'MMM d, yyyy' | 'MMM yyyy';
  unit: 'day' | 'month' | 'year';
  getWidgetTitle: (date?: string) => string;
  callbacks?:
    | _DeepPartialObject<TooltipCallbacks<'line', TooltipModel<'line'>, TooltipItem<'line'>>>
    | undefined;
};

export const getSpeedGraphConfig = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  const numDays = endDate.diff(startDate, 'day');

  if (numDays < 150) {
    return SPEED_RANGE_PARAM_MAP.day;
  }
  if (numDays <= 730) {
    return SPEED_RANGE_PARAM_MAP.week;
  }
  return SPEED_RANGE_PARAM_MAP.month;
};

const getWeeklyTitle = (date: string) => {
  const dateObject = dayjs(date);
  return `Week of ${dateObject.format('MMM D, YYYY')}`;
};

const getMonthlyTitle = (date: string) => {
  const dateObject = dayjs(date);
  return `${dateObject.format('MMMM YYYY')}`;
};

export const SPEED_RANGE_PARAM_MAP: { [s: string]: ParamsType } = {
  day: {
    agg: 'daily',
    tooltipFormat: 'MMM d, yyyy',
    unit: 'day',
    getWidgetTitle: (date) => todayOrDate(dayjs(date)),
  },
  week: {
    agg: 'weekly',
    tooltipFormat: 'MMM d, yyyy',
    callbacks: {
      title: (context) => `Week of ${context[0].label}`,
    },
    unit: 'month',
    getWidgetTitle: getWeeklyTitle,
  },
  month: {
    agg: 'monthly',
    tooltipFormat: 'MMM yyyy',
    unit: 'year',
    getWidgetTitle: getMonthlyTitle,
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

// Peak_MPH removed in #825
