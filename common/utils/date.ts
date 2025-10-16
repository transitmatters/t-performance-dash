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
