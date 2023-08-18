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
          <WidgetText isLarge={isLarge} text={duration.format('m').padStart(2, '0')} />
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

interface GetClockFormattedTimeStringOptions {
  truncateLeadingZeros?: boolean;
  showSeconds?: boolean;
  showHours?: boolean;
  use12Hour?: boolean;
}

export const getClockFormattedTimeString = (
  time: number,
  options: GetClockFormattedTimeStringOptions = {}
): string => {
  time = Math.round(time);
  const {
    truncateLeadingZeros = true,
    showSeconds = false,
    showHours = true,
    use12Hour = false,
  } = options;
  let seconds = time,
    minutes = 0,
    hours = 0;
  const minutesToAdd = Math.floor(seconds / 60);
  seconds = seconds % 60;
  minutes = minutes += minutesToAdd;
  const hoursToAdd = Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours += hoursToAdd;
  const isPM = hours >= 12 && hours < 24;
  hours = (use12Hour && hours > 12 ? hours - 12 : hours) % 24;
  // eslint-disable-next-line prefer-const
  let [hoursString, minutesString, secondsString] = [hours, minutes, seconds].map((num) =>
    num.toString().padStart(2, '0')
  );
  let timeString = [hoursString, minutesString, secondsString]
    .slice(showHours ? 0 : 1)
    .slice(0, showSeconds ? 3 : 2)
    .join(':');
  if (truncateLeadingZeros && timeString.startsWith('0')) {
    timeString = timeString.slice(1);
  }
  if (use12Hour) {
    return `${timeString} ${isPM ? 'PM' : 'AM'}`;
  }
  return timeString;
};
