import { describe, expect, it } from 'vitest';
import { parseSearch, stringifySearch } from './searchParams';

describe('parseSearch', () => {
  it('keeps values as strings, like Next router.query', () => {
    expect(parseSearch('?busRoute=1&date=2024-01-01')).toEqual({
      busRoute: '1',
      date: '2024-01-01',
    });
  });

  it('collects repeated keys into an array', () => {
    expect(parseSearch('?from=a&from=b')).toEqual({ from: ['a', 'b'] });
  });

  it('decodes both %20 and + as spaces', () => {
    expect(parseSearch('?a=x%20y&b=x+y')).toEqual({ a: 'x y', b: 'x y' });
  });
});

describe('stringifySearch', () => {
  it('drops undefined values and round-trips', () => {
    const search = { startDate: '2024-01-01', endDate: undefined, to: ['1', '2'] };
    const str = stringifySearch(search);
    expect(str).toBe('?startDate=2024-01-01&to=1&to=2');
    expect(parseSearch(str)).toEqual({ startDate: '2024-01-01', to: ['1', '2'] });
  });

  it('returns an empty string for no params', () => {
    expect(stringifySearch({})).toBe('');
  });
});
