import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
  BUS_SPEED_MAP_MIN_DATE,
  DATE_FORMAT,
  OVERVIEW_OPTIONS,
  RIDE_MAX_DATE,
  TODAY_STRING,
  YESTERDAY_STRING,
} from '../constants/dates';
import { getDefaultDates } from '../state/defaults/dateDefaults';
import { getCanonicalSearchHref, getDateRedirectHref, normalizeDateParams } from './dateParams';
import type { SearchObject } from './searchParams';

const range = (search: SearchObject, page: 'speed' | 'multiTrips' = 'speed') =>
  normalizeDateParams({
    section: page === 'speed' ? 'line' : 'multiTrips',
    tab: 'Subway',
    page,
    search,
  });

const single = (search: SearchObject) =>
  normalizeDateParams({ section: 'singleTrips', tab: 'Subway', page: 'singleTrips', search });

const daysBefore = (date: string, days: number) =>
  dayjs(date).subtract(days, 'day').format(DATE_FORMAT);

// The line pages' default window is the past year: 365 or 366 days.
const LINE_WINDOW_DAYS = dayjs(TODAY_STRING).diff(OVERVIEW_OPTIONS.year.startDate, 'day');

describe('normalizeDateParams on range pages', () => {
  it('leaves a complete range alone', () => {
    expect(range({ startDate: '2025-01-01', endDate: '2025-02-01', from: 'a' })).toBeUndefined();
  });

  it('fills in the default range when there are no dates', () => {
    expect(range({ from: 'a' })).toEqual({
      from: 'a',
      startDate: OVERVIEW_OPTIONS.year.startDate,
      endDate: TODAY_STRING,
    });
    expect(range({}, 'multiTrips')).toEqual(getDefaultDates('multiTrips', 'Subway'));
  });

  it('prefers the last complete range from the session', () => {
    expect(
      normalizeDateParams({
        section: 'line',
        tab: 'Subway',
        page: 'speed',
        search: {},
        stored: { startDate: '2024-03-01', endDate: '2024-04-01' },
      })
    ).toEqual({ startDate: '2024-03-01', endDate: '2024-04-01' });
  });

  it('reads a lone start date as "since then"', () => {
    expect(range({ startDate: '2025-01-01' })).toEqual({
      startDate: '2025-01-01',
      endDate: TODAY_STRING,
    });
  });

  it('opens the default window before a lone end date', () => {
    expect(range({ endDate: '2025-03-10' }, 'multiTrips')).toEqual({
      startDate: '2025-03-03',
      endDate: '2025-03-10',
    });
  });

  it('ends the range on a single date carried over from a single-day page', () => {
    expect(range({ date: '2025-03-10' }, 'multiTrips')).toEqual({
      startDate: '2025-03-03',
      endDate: '2025-03-10',
    });
  });

  it('swaps reversed dates', () => {
    expect(range({ startDate: '2025-02-01', endDate: '2025-01-01' })).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-02-01',
    });
  });

  it('treats empty, malformed and impossible dates as missing', () => {
    expect(range({ startDate: '2025-01-01', endDate: '' })?.endDate).toBe(TODAY_STRING);
    expect(range({ startDate: '2025-01-01', endDate: 'foo' })?.endDate).toBe(TODAY_STRING);
    expect(range({ startDate: '2025-02-30', endDate: '2025-03-10' }, 'multiTrips')).toEqual({
      startDate: '2025-03-03',
      endDate: '2025-03-10',
    });
    expect(range({ startDate: ['2025-01-01', '2025-01-02'], endDate: '2025-03-10' })).toEqual({
      startDate: daysBefore('2025-03-10', LINE_WINDOW_DAYS),
      endDate: '2025-03-10',
    });
  });

  it('reopens a window when the range is a single day', () => {
    expect(range({ startDate: '2025-03-10', endDate: '2025-03-10' }, 'multiTrips')).toEqual({
      startDate: '2025-03-03',
      endDate: '2025-03-10',
    });
  });

  it('clamps to the page bounds without collapsing the range', () => {
    expect(
      normalizeDateParams({
        section: 'line',
        tab: 'The RIDE',
        page: 'ridership',
        search: { startDate: '2026-01-01', endDate: '2026-02-01' },
      })
    ).toEqual({ startDate: daysBefore(RIDE_MAX_DATE, LINE_WINDOW_DAYS), endDate: RIDE_MAX_DATE });
  });

  it('clamps to a retired bus route', () => {
    expect(
      normalizeDateParams({
        section: 'multiTrips',
        tab: 'Bus',
        page: 'multiTrips',
        search: { busRoute: '86-legacy', startDate: '2025-01-01', endDate: '2025-02-01' },
      })
    ).toEqual({ busRoute: '86-legacy', startDate: '2024-12-07', endDate: '2024-12-14' });
  });
});

describe('normalizeDateParams on single-day pages', () => {
  it('leaves a single date alone', () => {
    expect(single({ date: '2025-03-10', from: 'a', to: 'b' })).toBeUndefined();
  });

  it('fills in the default date', () => {
    expect(single({})).toEqual(getDefaultDates('singleTrips', 'Subway'));
  });

  it('turns range params into the last day of the range', () => {
    expect(single({ startDate: '2025-03-01', endDate: '2025-03-10' })).toEqual({
      date: '2025-03-10',
    });
    expect(single({ startDate: '2025-03-01' })).toEqual({ date: '2025-03-01' });
  });

  it('clamps to the speed map window', () => {
    const speedmap = (date: string) =>
      normalizeDateParams({
        section: 'singleTrips',
        tab: 'Bus',
        page: 'speedmap',
        search: { busRoute: '1', date },
      });
    expect(speedmap('2016-01-01')).toEqual({ busRoute: '1', date: BUS_SPEED_MAP_MIN_DATE });
    expect(speedmap(TODAY_STRING)).toEqual({ busRoute: '1', date: YESTERDAY_STRING });
  });
});

describe('getDateRedirectHref', () => {
  it('fills in dates on dated pages', () => {
    expect(getDateRedirectHref('/red/trips/single/', { from: 'a', to: 'b' })).toMatch(
      /^\/red\/trips\/single\/\?from=a&to=b&date=\d{4}-\d{2}-\d{2}$/
    );
    expect(getDateRedirectHref('/system/slowzones/', {})).toMatch(
      /^\/system\/slowzones\/\?startDate=.+&endDate=.+$/
    );
  });

  it('leaves pages without dates alone', () => {
    expect(getDateRedirectHref('/', {})).toBeUndefined();
    expect(getDateRedirectHref('/red/', { view: 'year' })).toBeUndefined();
    expect(getDateRedirectHref('/bus/', { busRoute: '1' })).toBeUndefined();
    // Red has no leaderboard; the route 404s it.
    expect(getDateRedirectHref('/red/leaderboard/', {})).toBeUndefined();
  });

  it('leaves embeds alone, so one without dates keeps showing the latest range', () => {
    expect(getDateRedirectHref('/embed/red/slowzones/', {})).toBeUndefined();
    expect(getDateRedirectHref('/embed/system/slowzones/', {})).toBeUndefined();
  });

  it('is idempotent', () => {
    const href = getDateRedirectHref('/red/speed/', { startDate: '2025-01-01' })!;
    const [pathname, query] = href.split('?');
    expect(
      getDateRedirectHref(pathname, Object.fromEntries(new URLSearchParams(query)))
    ).toBeUndefined();
  });
});

describe('getCanonicalSearchHref', () => {
  it("drops another mode's route param", () => {
    expect(getCanonicalSearchHref('/orange/', { busRoute: '1' })).toBe('/orange/');
    expect(getCanonicalSearchHref('/orange/', { busRoute: '1', view: 'year' })).toBe(
      '/orange/?view=year'
    );
  });

  it('fills in dates after dropping it', () => {
    expect(
      getCanonicalSearchHref('/orange/speed/', { busRoute: '1', startDate: '2025-01-01' })
    ).toBe(`/orange/speed/?startDate=2025-01-01&endDate=${TODAY_STRING}`);
  });

  it('leaves canonical URLs alone', () => {
    expect(getCanonicalSearchHref('/bus/', { busRoute: '1' })).toBeUndefined();
    expect(getCanonicalSearchHref('/red/', {})).toBeUndefined();
  });
});
