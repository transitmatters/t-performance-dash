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
  label: 'Time',
  format: 'h a',
};

export const defaultDayAxis: ResolvedTimeAxis = {
  granularity: 'day',
  label: 'Date',
  format: 'MMM d',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultWeekAxis: ResolvedTimeAxis = {
  granularity: 'week',
  axisUnit: 'month',
  label: 'Date',
  format: 'MMM',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultMonthAxis: ResolvedTimeAxis = {
  granularity: 'month',
  axisUnit: 'month',
  label: 'Month',
  format: 'yyyy',
  tooltipFormat: 'MMM yyyy',
};
