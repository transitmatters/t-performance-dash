export type SearchObject = Record<string, string | string[] | undefined>;

/**
 * Query strings parse to plain strings (or string arrays for repeated keys). TanStack Router's
 * default JSON-parses values, which would turn `?busRoute=1`
 * into a number and break every consumer that compares against string route ids.
 */
export const parseSearch = (searchStr: string): SearchObject => {
  const params = new URLSearchParams(searchStr.startsWith('?') ? searchStr.slice(1) : searchStr);
  const search: SearchObject = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    search[key] = values.length > 1 ? values : values[0];
  }
  return search;
};

/** A URL parameter's text; parameters are strings, numbers or booleans, and anything else is dropped. */
export const paramText = (value: unknown): string | undefined =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : undefined;

export const stringifySearch = (search: Record<string, unknown>): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    const values: unknown[] = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      const text = paramText(item);
      if (text !== undefined) params.append(key, text);
    });
  }
  const searchStr = params.toString();
  return searchStr ? `?${searchStr}` : '';
};
