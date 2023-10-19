import type { DataPoint, TimeAxis, DisplayStyle } from './types';

export const defaultStyle: DisplayStyle<DataPoint> = {
  color: '#ddd',
  width: 2,
  fillColor: null,
  fillPattern: 'solid',
  pointColor: null,
  pointRadius: 0,
  pointHitRadius: 0,
  stepped: false,
  tension: 0,
  tooltipLabel: (point, context) => {
    return `${context.dataset.label}: ${point.value.toString()}`;
  },
};

export const defaultTimeAxis: TimeAxis = {
  granularity: 'time',
  label: 'Time',
  format: 'h a',
};

export const defaultDayAxis: TimeAxis = {
  granularity: 'day',
  label: 'Date',
  format: 'MMM d',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultWeekAxis: TimeAxis = {
  granularity: 'week',
  label: 'Date',
  format: 'MMM d',
  tooltipFormat: 'MMM d, yyyy',
};

export const defaultMonthAxis: TimeAxis = {
  granularity: 'month',
  label: 'Month',
  format: 'MMM yyyy',
};

export const defaultYearAxis: TimeAxis = {
  granularity: 'year',
  label: 'Year',
  format: 'yyyy',
};
