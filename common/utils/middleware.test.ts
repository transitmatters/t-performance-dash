import { describe, expect, it } from 'vitest';
import { TODAY_STRING } from '../constants/dates';
import { getV3RedirectHref } from './middleware';

const redirect = (pathname: string, search: string) =>
  getV3RedirectHref(pathname, new URLSearchParams(search));

describe('getV3RedirectHref', () => {
  it('sends v3 rapid transit config links to the trip pages', () => {
    expect(redirect('/rapidtransit', 'config=Red,place-davis,place-portr,2023-01-01,')).toBe(
      '/red/trips/single/?from=place-davis&to=place-portr&date=2023-01-01'
    );
    expect(redirect('/rapidtransit/', 'config=Orange,a,b,2023-01-01,2023-02-01')).toBe(
      '/orange/trips/multi/?from=a&to=b&startDate=2023-01-01&endDate=2023-02-01'
    );
  });

  it('sends v3 slow zone links to the system page, filling in an end date', () => {
    expect(redirect('/slowzones/', 'startDate=2023-01-01')).toBe(
      `/system/slowzones/?startDate=2023-01-01&endDate=${TODAY_STRING}`
    );
  });

  it('sends v3 bus links to bus trips', () => {
    expect(redirect('/bus', 'config=1,a,b,2023-01-01,')).toBe(
      '/bus/trips/single/?from=a&to=b&date=2023-01-01&busRoute=1'
    );
    expect(redirect('/bus/', 'foo=bar')).toBe('/bus/trips/single/?busRoute=1');
  });

  it('leaves current URLs alone', () => {
    expect(redirect('/red/', 'view=year')).toBeUndefined();
    expect(redirect('/bus/', '')).toBeUndefined();
  });
});
