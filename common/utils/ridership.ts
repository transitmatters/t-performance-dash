import type { LineData, Time } from '../types/ridership';

export const MINUTE = 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const asPercentString = (p: number) => Math.round(100 * p).toString() + '%';

export const getRidershipNoun = (lineId: string) => {
  if (['line-Red', 'line-Orange', 'line-Blue', 'line-Green'].includes(lineId)) {
    return 'faregate validations';
  }
  return 'riders';
};

export const normalizeToPercent = (timeSeries: number[]) => {
  const firstValue = timeSeries[0];
  return timeSeries.map((n) => n / firstValue);
};

export const stringify12Hour = (time: Time) => {
  const hours = Math.floor(time / HOUR);
  const isPM = hours >= 12 && hours < 24;
  return `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours} ${isPM ? 'PM' : 'AM'}`;
};

export const getHighestTphValue = (lineData: LineData) => {
  let max = 0;
  Object.entries(lineData.serviceRegimes).forEach(([key, regime]) => {
    if (key === 'baseline' || key === 'current') {
      Object.values(regime).forEach((serviceLevel) => {
        if (serviceLevel.tripsPerHour) {
          max = Math.max(max, ...serviceLevel.tripsPerHour);
        }
      });
    }
  });
  return max;
};

export const getHourlyTickValues = (periodHours: number, start = 0, end = 24, offset = 0) => {
  const values: string[] = [];
  for (let i = start; i < end; i++) {
    if ((i - offset) % periodHours === 0) {
      values.push(stringify12Hour(i * HOUR));
    }
  }
  return values;
};
