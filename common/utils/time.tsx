import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { WidgetText } from '../components/widgets/internal/WidgetText';
import { UnitText } from '../components/widgets/internal/UnitText';
dayjs.extend(duration);

export const getTimeUnit = (value: number) => {
  const secondsAbs = Math.abs(value);
  switch (true) {
    case secondsAbs < 100:
      return 'sec';
    case secondsAbs < 3600:
      return 'min';
    default:
      return 'hrs';
  }
};

export const getFormattedTimeValue = (value: number, light?: boolean) => {
  const absValue = Math.round(Math.abs(value));
  const duration = dayjs.duration(absValue, 'seconds');
  switch (true) {
    case absValue < 100:
      return (
        <p>
          <WidgetText light={light} text={absValue.toFixed(0)} />
          <UnitText light={light} text={'s'} />
        </p>
      );
    case absValue < 3600:
      return (
        <p>
          <WidgetText light={light} text={duration.format('m')} />
          <UnitText light={light} text={'m'} />{' '}
          <WidgetText light={light} text={duration.format('s').padStart(2, '0')} />
          <UnitText light={light} text={'s'} />
        </p>
      );
    default:
      return (
        <p>
          <WidgetText light={light} text={duration.format('H')} />
          <UnitText light={light} text={'h'} />{' '}
          <WidgetText light={light} text={duration.format('m').padStart(2, '0')} />
          <UnitText light={light} text={'m'} />
        </p>
      );
  }
};

export const getFormattedTimeString = (value: number, unit: 'minutes' | 'seconds' = 'seconds') => {
  const secondsValue = unit === 'seconds' ? value : value * 60;
  const absValue = Math.round(Math.abs(secondsValue));
  const duration = dayjs.duration(absValue, 'seconds');
  switch (true) {
    case absValue < 100:
      return `${absValue}s`;
    case absValue < 3600:
      return `${duration.format('m')}m ${duration.format('s').padStart(2, '0')}s`;
    default:
      return `${duration.format('H')}h ${duration.format('m').padStart(2, '0')}m`;
  }
};
