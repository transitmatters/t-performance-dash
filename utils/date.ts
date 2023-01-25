export const getCurrentDate = () => {
  const iso_date = new Date();
  const offset = iso_date.getTimezoneOffset();
  const local_date = new Date(iso_date.valueOf() - offset * 60 * 1000);
  const maxDate = local_date.toISOString().split('T')[0];
  return maxDate;
};
