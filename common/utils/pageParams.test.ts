import { describe, expect, it } from 'vitest';
import { getCanonicalSearchHref } from './dateParams';
import { parseLinePage, parsePageDates, parseTripPage } from './pageParams';
import { routeFromLocation } from './router';
import { parseSearch } from './searchParams';

const route = (url: string) => {
  const [pathname, search = ''] = url.split('?');
  return routeFromLocation(pathname, parseSearch(search));
};

const canonical = (url: string) => {
  const [pathname, search = ''] = url.split('?');
  return route(getCanonicalSearchHref(pathname, parseSearch(search)) ?? url);
};

describe('parseLinePage', () => {
  it('names the line from LINE_OBJECTS', () => {
    expect(parseLinePage(route('/the-ride/'))?.lineShort).toBe('The RIDE');
    expect(parseLinePage(route('/bus/?busRoute=1'))).toMatchObject({
      line: 'line-bus',
      lineShort: 'Bus',
      busRoute: '1',
    });
  });

  it('is undefined off a line', () => {
    expect(parseLinePage(route('/system/slowzones/'))).toBeUndefined();
  });
});

describe('parsePageDates', () => {
  it("reads the page's kind of dates", () => {
    expect(parsePageDates(route('/red/trips/single/?date=2026-01-05'))).toEqual({
      kind: 'single',
      date: '2026-01-05',
    });
    expect(parsePageDates(route('/red/speed/?startDate=2026-01-01&endDate=2026-02-01'))).toEqual({
      kind: 'range',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    });
  });

  it('rejects missing, partial or malformed dates', () => {
    expect(parsePageDates(route('/red/trips/single/'))).toBeUndefined();
    expect(parsePageDates(route('/red/speed/?startDate=2026-01-01'))).toBeUndefined();
    expect(parsePageDates(route('/red/trips/single/?date=2026-02-31'))).toBeUndefined();
  });
});

describe('parseTripPage', () => {
  it('resolves the stations', () => {
    const trip = parseTripPage(route('/red/trips/single/?date=2026-01-05&from=70063&to=70065'));
    expect(trip?.fromStation.station).toBe('place-davis');
    expect(trip?.toStation.station).toBe('place-portr');
  });

  it.each([
    '/red/trips/single/',
    '/red/trips/multi/',
    '/orange/trips/single/?from=nope',
    '/bus/trips/multi/?busRoute=1',
    '/commuter-rail/trips/single/',
    '/ferry/trips/single/',
  ])('parses whatever the router turns %s into', (url) => {
    expect(parseTripPage(canonical(url))).toBeDefined();
  });

  it('is undefined for a bus route with no station file', () => {
    expect(parseTripPage(canonical('/bus/trips/single/?busRoute=34E'))).toBeUndefined();
  });
});
