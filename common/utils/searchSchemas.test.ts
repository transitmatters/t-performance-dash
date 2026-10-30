import { describe, expect, it } from 'vitest';
import { parseSearch, stringifySearch } from './searchParams';
import {
  validateEmbedSearch,
  validateLineSearch,
  validateOverviewSearch,
  validateTripSearch,
} from './searchSchemas';

/** What a route sees: TanStack merges the validated params over the raw ones. */
const resolve = (validate: (search: Record<string, unknown>) => object, searchStr: string) => {
  const raw = parseSearch(searchStr);
  return { ...raw, ...validate(raw) };
};

describe('search validators', () => {
  it('keep a real link byte-for-byte', () => {
    const searchStr =
      '?from=place-davis&to=place-pktrm&date=2025-01-01&busRoute=1&ttDays=weekday&peak=am&utm_source=x';
    expect(stringifySearch(resolve(validateTripSearch, searchStr))).toBe(searchStr);
  });

  it('keep route ids as strings', () => {
    expect(validateLineSearch(parseSearch('?busRoute=1')).busRoute).toBe('1');
  });

  it('blank values outside their set, even over the raw search', () => {
    expect(resolve(validateOverviewSearch, '?view=bogus&redesign=1')).toMatchObject({
      view: undefined,
      redesign: undefined,
    });
    expect(resolve(validateOverviewSearch, '?view=month&redesign=0')).toMatchObject({
      view: 'month',
      redesign: '0',
    });
    expect(validateEmbedSearch({ theme: 'blue' }).theme).toBeUndefined();
    expect(validateEmbedSearch({ theme: 'dark' }).theme).toBe('dark');
  });

  it('take the first of a repeated key and drop empty ones', () => {
    expect(validateLineSearch(parseSearch('?from=a&from=b&to='))).toMatchObject({
      from: 'a',
      to: undefined,
    });
  });

  it('never add a value the URL lacks', () => {
    const validated = validateTripSearch({});
    expect(Object.values(validated).every((value) => value === undefined)).toBe(true);
  });
});
