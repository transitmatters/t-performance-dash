export type SearchObject = Record<string, string | string[] | undefined>;

/**
 * Query strings parse to plain strings (or string arrays for repeated keys), the same shape Next's
 * `router.query` had. TanStack Router's default JSON-parses values, which would turn `?busRoute=1`
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

export const stringifySearch = (search: Record<string, unknown>): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)));
    else params.append(key, String(value));
  }
  const searchStr = params.toString();
  return searchStr ? `?${searchStr}` : '';
};
