export const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() < 9 ? '0' : ''}${date.getMonth()+1}-${date.getDate() < 10 ? '0': ''}${date.getDate()}`
}


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