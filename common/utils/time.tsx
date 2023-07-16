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

export const getFormattedTimeValue = (value: number, isLarge?: boolean) => {
  const absValue = Math.round(Math.abs(value));
  const duration = dayjs.duration(absValue, 'seconds');
  switch (true) {
    case absValue < 100:
      return (
        <p>
          <WidgetText isLarge={isLarge} text={absValue.toFixed(0)} />
          <UnitText isLarge={isLarge} text={'s'} />
        </p>
      );
    case absValue < 3600:
      return (
        <p>
          <WidgetText isLarge={isLarge} text={duration.format('m')} />
          <UnitText isLarge={isLarge} text={'m'} />{' '}
          <WidgetText isLarge={isLarge} text={duration.format('s').padStart(2, '0')} />
          <UnitText isLarge={isLarge} text={'s'} />
        </p>
      );
    default:
      return (
        <p>
          <WidgetText isLarge={isLarge} text={duration.format('H')} />
          <UnitText isLarge={isLarge} text={'h'} />{' '}
          <WidgetText text={duration.format('m').padStart(2, '0')} />
          <UnitText isLarge={isLarge} text={'m'} />
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
