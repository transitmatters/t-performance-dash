import { hasKey } from './hasKey';

/** Whether `value` is one of `values`, narrowing it to their type. */
export const isOneOf = <T>(values: readonly T[], value: unknown): value is T =>
  values.some((candidate) => candidate === value);

/** `Object.keys`, typed by the object's keys. */
export const objectKeys = <T extends object>(obj: T): (keyof T & string)[] =>
  Object.keys(obj).filter((key): key is keyof T & string => hasKey(obj, key));

/** `Object.entries`, typed by the object's keys and values. */
export const objectEntries = <T extends object>(obj: T): [keyof T & string, T[keyof T]][] =>
  objectKeys(obj).map((key): [keyof T & string, T[keyof T]] => [key, obj[key]]);

/** An object with one entry per key, each set to `valueFor(key)`. */
export const recordFromKeys = <K extends PropertyKey, V>(
  keys: readonly K[],
  valueFor: (key: K) => V
): Record<K, V> => {
  const record: Partial<Record<K, V>> = {};
  keys.forEach((key) => {
    record[key] = valueFor(key);
  });
  // oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion -- every key was just set; TS can't see that
  return record as Record<K, V>;
};
