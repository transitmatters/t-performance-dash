export const indexByProperty = <T extends { [key: string]: any }>(
  array: T[],
  property: keyof T
): Record<string, T | undefined> => {
  const res: Record<string, T> = {};
  array.forEach((el) => {
    res[el[property]] = el;
  });
  return res;
};
