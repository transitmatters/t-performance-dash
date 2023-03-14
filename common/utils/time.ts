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
  // eslint-disable-next-line prefer-const
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
