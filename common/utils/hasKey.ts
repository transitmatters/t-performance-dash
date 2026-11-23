/** Whether `key` is one of `obj`'s own keys, narrowing it so `obj[key]` type-checks. */
export const hasKey = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
  Object.hasOwn(obj, key);
