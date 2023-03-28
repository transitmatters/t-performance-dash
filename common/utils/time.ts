import dayjs from 'dayjs';

export const getTimeUnit = (value: number) => {
  const secondsAbs = Math.abs(value);
  switch (true) {
    case secondsAbs < 99:
      return 'sec';
    case secondsAbs < 3600:
      return 'min.';
    default:
      return 'hrs.';
  }
};

export const getFormattedTimeValue = (value: number | undefined) => {
  if (value === undefined) return undefined;
  const absValue = Math.abs(value);
  switch (true) {
    case absValue < 99:
      return absValue.toFixed(0);
    case absValue < 3600:
      return dayjs.duration(absValue, 'seconds').format('m:ss');
    default:
      return (absValue / 3600).toFixed(2);
  }
};
