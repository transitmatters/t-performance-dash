import dayjs from 'dayjs';

type StringifyTimeOptions = {
  truncateLeadingHoursZeros?: boolean;
  truncateLeadingMinutesZeros?: boolean;
  showSeconds?: boolean;
  showHours?: boolean;
  use12Hour?: boolean;
};

export const stringifyTime = (totalSeconds: number, options: StringifyTimeOptions = {}): string => {
  const {
    truncateLeadingHoursZeros = true,
    truncateLeadingMinutesZeros = false,
    showSeconds = false,
    showHours = true,
    use12Hour = false,
  } = options;
  let seconds = Math.round(totalSeconds),
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
  let [hoursString, minutesString, secondsString] = [hours, minutes, seconds].map((num) =>
    num.toString().padStart(2, '0')
  );
  if (truncateLeadingHoursZeros && hoursString.startsWith('0')) {
    hoursString = hoursString.slice(1);
  }
  if (truncateLeadingMinutesZeros && minutesString.startsWith('0')) {
    minutesString = minutesString.slice(1);
  }
  const timeString = [hoursString, minutesString, secondsString]
    .slice(showHours ? 0 : 1)
    .slice(0, showSeconds ? 3 : 2)
    .join(':');
  if (use12Hour) {
    return `${timeString} ${isPM ? 'PM' : 'AM'}`;
  }
  return timeString;
};

export const getTimeUnit = (value: number) => {
  const secondsAbs = Math.abs(value);
  switch (true) {
    case secondsAbs < 99:
      return 'sec.';
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
