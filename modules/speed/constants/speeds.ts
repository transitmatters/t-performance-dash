import type { TooltipCallbacks, TooltipItem, TooltipModel } from 'chart.js';
import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
import dayjs from 'dayjs';
import { todayOrDate } from '../../../common/constants/dates';

export type AggType = 'daily' | 'weekly' | 'monthly';
export type ParamsType = {
  agg: AggType;
  tooltipFormat: 'MMM d, yyyy' | 'MMM yyyy';
  unit: 'day' | 'month' | 'year';
  getWidgetTitle: (date: string) => string;
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
