import { Time } from './types';

export const MINUTE = 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const stringifyTime = (
  time: Time,
  { truncateLeadingZeros = true, showSeconds = false, use12Hour = false } = {}
): string => {
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
  if (truncateLeadingZeros && hoursString.startsWith('0')) {
    hoursString = hoursString.slice(1);
  }
  const timeString = [hoursString, minutesString, secondsString]
    .slice(0, showSeconds ? 3 : 2)
    .join(':');
  if (use12Hour) {
    return `${timeString} ${isPM ? 'PM' : 'AM'}`;
  }
  return timeString;
};

export const stringify12Hour = (time: Time) => {
  const hours = Math.floor(time / HOUR);
  const isPM = hours >= 12 && hours < 24;
  return `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours} ${isPM ? 'PM' : 'AM'}`;
};

export const getHourlyTickValues = (
  periodHours: number,
  start: number = 0,
  end: number = 24,
  offset: number = 0
) => {
  const values: string[] = [];
  for (let i = start; i < end; i++) {
    if ((i - offset) % periodHours === 0) {
      values.push(stringify12Hour(i * HOUR));
    }
  }
  return values;
};
