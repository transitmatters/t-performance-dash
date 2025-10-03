import type { Time } from './types';

const MINUTE = 60;
const HOUR = 60 * MINUTE;

const stringify12Hour = (time: Time) => {
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
