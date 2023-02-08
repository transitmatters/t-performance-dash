export const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() < 9 ? '0' : ''}${date.getMonth() + 1}-${
    date.getDate() < 10 ? '0' : ''
  }${date.getDate()}`;
};

export const prettyDate = (dateString: string, withDow: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: withDow ? 'long' : undefined,
  };

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
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

export const getOffsetDate = (date: string): string => {
  const isoDate = new Date(date);
  const offset = isoDate.getTimezoneOffset();
  const localDate = new Date(isoDate.valueOf() + offset * 60 * 1000);
  const offsetDate = localDate.toISOString().split('T')[0];
  return offsetDate;
};
