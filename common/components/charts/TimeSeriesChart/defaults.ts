import { i18n } from '../../../i18n';
import type { DataPoint, DisplayStyle, ResolvedTimeAxis } from './types';

export const defaultStyle: DisplayStyle<DataPoint> = {
  color: '#ddd',
  width: 2,
  fillColor: null,
  fillPattern: 'slightly-transparent',
  pointColor: null,
  pointRadius: 0,
  pointHitRadius: 0,
  stepped: false,
  tension: 0,
  tooltipLabel: (point, context) => {
    return `${context.dataset.label}: ${point.value.toString()}`;
  },
};

export const defaultTimeAxis: ResolvedTimeAxis = {
  granularity: 'time',
  label: i18n.t('charts.axis.time'),
  format: 'h a',
};

export const defaultDayAxis: ResolvedTimeAxis = {
  granularity: 'day',
  label: i18n.t('charts.axis.date'),
  format: 'MMM d',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultWeekAxis: ResolvedTimeAxis = {
  granularity: 'week',
  axisUnit: 'month',
  label: i18n.t('charts.axis.date'),
  format: 'MMM',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultMonthAxis: ResolvedTimeAxis = {
  granularity: 'month',
  axisUnit: 'year',
  label: i18n.t('charts.axis.month'),
  format: 'yyyy',
  tooltipFormat: 'MMM yyyy',
};
