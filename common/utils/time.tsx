import React from 'react';
import dayjs from 'dayjs';
import type { DurationUnitType } from 'dayjs/plugin/duration';
import { WidgetText } from '../components/widgets/internal/WidgetText';
import { UnitText } from '../components/widgets/internal/UnitText';

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

export const getFormattedTimeValue = (value: number) => {
  const absValue = Math.round(Math.abs(value));
  const duration = dayjs.duration(absValue, 'seconds');
  switch (true) {
    case absValue < 100:
      return (
        <p>
          <WidgetText text={absValue.toFixed(0)} />
          <UnitText text={'s'} />
        </p>
      );
    case absValue < 3600:
      return (
        <p>
          <WidgetText text={duration.format('m')} />
          <UnitText text={'m'} /> <WidgetText text={duration.format('s').padStart(2, '0')} />
          <UnitText text={'s'} />
        </p>
      );
    default:
      return (
        <p>
          <WidgetText text={duration.format('H')} />
          <UnitText text={'h'} /> <WidgetText text={duration.format('m').padStart(2, '0')} />
          <UnitText text={'m'} />
        </p>
      );
  }
};

export const getFormattedTimeString = (value: number, unit: DurationUnitType = 'seconds') => {
  if (unit === 'seconds') {
    const absValue = Math.round(Math.abs(value));
    const duration = dayjs.duration(absValue, unit);
    switch (true) {
      case absValue < 100:
        return `${absValue}s`;
      case absValue < 3600:
        return `${duration.format('m')}m ${duration.format('s').padStart(2, '0')}s`;
      default:
        return `${duration.format('H')}h ${duration.format('m').padStart(2, '0')}m`;
    }
  } else if (unit === 'minutes') {
    const absValue = Math.abs(value);
    const duration = dayjs.duration(absValue, unit);
    switch (true) {
      case absValue < 60:
        return `${duration.format('m')}m ${duration.format('s').padStart(2, '0')}s`;
      default:
        return `${duration.format('H')}h ${duration.format('m').padStart(2, '0')}m`;
    }
  }
};
