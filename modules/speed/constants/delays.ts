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
  // TODO: type this
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
  RL: 8374.5,
  BL: 1860.5,
  OL: 3776.75,
  DEFAULT: 1,
};
