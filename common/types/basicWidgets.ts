import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export type WidgetUnit = 'time' | 'quantity';

export type WidgetType = {
  format: (value: number) => string;
  description?: string;
};
export type WidgetFormat = Record<WidgetUnit, WidgetType>;

export const WIDGET_UNITS: WidgetFormat = {
  time: {
    description: 'min.',
    format: (seconds) => dayjs.duration(Math.abs(seconds), 'seconds').format('m:ss'),
  },
  quantity: {
    description: 'zones',
    format: (quantity) => Math.abs(quantity).toString(),
  },
};
