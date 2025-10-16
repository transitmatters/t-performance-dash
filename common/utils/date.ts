export const prettyDate = (dateString: string, withDow: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: withDow ? 'long' : undefined,
  };

  const fullDate = dateString.includes('T')
    ? dateString
    : /* Offset so that it's always past midnight in Boston */ `${dateString}T07:00:00`;

  return new Date(fullDate).toLocaleDateString(
    undefined, // user locale/language
    options
  );
};

export const getCurrentDate = (): string => {
  const isoDate = new Date();
  const offset = isoDate.getTimezoneOffset();
  const localDate = new Date(isoDate.valueOf() - offset * 60 * 1000);
  const maxDate = localDate.toISOString().split('T')[0];
  return maxDate;
};

/**
 * Check if a given service date string is a weekend (Saturday or Sunday)
 * @param serviceDateString - Date string in YYYY-MM-DD format
 * @returns true if the date is a weekend (Saturday or Sunday), false otherwise
 */
export const isWeekend = (serviceDateString: string): boolean => {
  const date = new Date(`${serviceDateString}T12:00:00`); // Use noon to avoid timezone issues
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Check if a datapoint represents a weekend or holiday
 * Uses API-provided holiday information when available, falls back to weekend-only check
 * @param datapoint - AggregateDataPoint with optional holiday field
 * @returns true if the date is a weekend or holiday, false otherwise
 */
export const isWeekendOrHolidayFromData = (datapoint: {
  service_date?: string;
  holiday?: boolean;
}): boolean => {
  // If we have holiday data from the API, use it combined with weekend check
  if (datapoint.holiday !== undefined && datapoint.service_date) {
    return datapoint.holiday || isWeekend(datapoint.service_date);
  }

  // Fallback to weekend-only check if holiday data isn't available
  if (datapoint.service_date) {
    return isWeekend(datapoint.service_date);
  }

  return false;
};
