import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { RidershipCount } from '../types/dataPoints';
import { getSeason, getSeasonalMaximum, getSeasonalMaximums } from './seasonalRidership';

const counts = (points: [string, number | null][]) =>
  points.map(([date, count]) => ({ date, count })) as RidershipCount[];

describe('getSeason', () => {
  // West of UTC, where `new Date('2019-12-23')` is still the 22nd, a Sunday.
  beforeAll(() => vi.stubEnv('TZ', 'America/New_York'));
  afterAll(() => vi.unstubAllEnvs());

  it('matches Thanksgiving week across years, though its ISO week moves', () => {
    expect(getSeason('2018-11-19')).toEqual({
      key: 'Thanksgiving',
      week: 'week-47',
      holiday: 'Thanksgiving',
    });
    expect(getSeason('2019-11-25')).toEqual({
      key: 'Thanksgiving',
      week: 'week-48',
      holiday: 'Thanksgiving',
    });
    // The week after Thanksgiving 2018 has the ISO week Thanksgiving 2019 fell in
    expect(getSeason('2018-11-26')).toEqual({ key: 'week-48', week: 'week-48' });
  });

  it('uses the observed date of weekend holidays', () => {
    // Christmas 2021 was a Saturday, observed Friday the 24th
    expect(getSeason('2021-12-20').key).toBe('Christmas');
    // Christmas 2022 was a Sunday, observed Monday the 26th
    expect(getSeason('2022-12-19').key).toBe('week-51');
    expect(getSeason('2022-12-26').key).toBe('Christmas');
    // New Year's Day 2022 was a Saturday, observed Friday, December 31
    expect(getSeason('2021-12-27').key).toBe("New Year's");
  });

  it('reads the week of a mid-week date', () => {
    expect(getSeason('2019-11-27').key).toBe('Thanksgiving');
    expect(getSeason('2019-12-18').key).toBe('week-51');
  });

  it('numbers ordinary weeks by ISO week', () => {
    expect(getSeason('2020-01-13').key).toBe('week-3');
    expect(getSeason('2019-12-30').key).toBe("New Year's");
    expect(getSeason('2024-12-30').key).toBe("New Year's");
    expect(getSeason('2025-01-06').key).toBe('week-2');
  });

  it('reads dates as calendar days, not local midnight', () => {
    expect(getSeason('2019-12-23').key).toBe('Christmas');
    expect(getSeason('2019-12-16').key).toBe('week-51');
  });
});

describe('getSeasonalMaximums', () => {
  it('keeps the most riders in each season', () => {
    const maximums = getSeasonalMaximums(
      counts([
        ['2018-11-19', 190_000], // Thanksgiving 2018
        ['2018-11-26', 203_000],
        ['2019-11-18', 195_000],
        ['2019-11-25', 157_000], // Thanksgiving 2019
        ['2019-12-23', 105_000], // Christmas 2019
        ['2018-12-24', 100_000], // Christmas 2018
      ]),
      '2023-11-09'
    );
    expect(maximums.get('Thanksgiving')).toBe(190_000);
    expect(maximums.get('week-48')).toBe(203_000);
    expect(maximums.get('week-47')).toBe(195_000);
    expect(maximums.get('Christmas')).toBe(105_000);
  });

  it('lets an ordinary week borrow holiday weeks with its ISO week number', () => {
    const maximums = getSeasonalMaximums(
      counts([
        ['2018-09-03', 202_356], // Labor Day 2018, week 36
        ['2019-09-02', 195_698], // Labor Day 2019, week 36
        ['2020-08-31', 42_198], // The only ordinary week 36: the 2020 lockdown
      ]),
      '2023-11-09'
    );
    // Labor Day 2026 is the 7th, so the week of August 31 is an ordinary week 36
    expect(getSeasonalMaximum(maximums, '2026-08-31')?.value).toBe(202_356);
    expect(getSeasonalMaximum(maximums, '2026-09-07')).toEqual({
      value: 202_356,
      season: 'Labor Day week',
    });
  });

  it('only uses weeks that ended by the cutoff, like the published baseline', () => {
    const maximums = getSeasonalMaximums(
      counts([
        ['2022-11-07', 100_000], // Veterans Day 2022
        ['2023-11-06', 900_000], // Veterans Day 2023, but the week ends the 12th, after the cutoff
        ['2023-10-30', 120_000],
      ]),
      '2023-11-09'
    );
    expect(maximums.get('Veterans Day')).toBe(100_000);
    expect(maximums.get('week-44')).toBe(120_000);
  });

  it("prefers a week's Monday record to stray mid-week ones, as data-ingestion does", () => {
    const maximums = getSeasonalMaximums(
      counts([
        ['2019-03-04', 10_000],
        ['2019-03-06', 20_000],
        ['2019-03-13', 8_000],
        ['2019-03-14', 12_000],
      ]),
      '2023-11-09'
    );
    expect(maximums.get('week-10')).toBe(10_000);
    expect(maximums.get('week-11')).toBe(10_000);
  });

  it('skips missing and zero weeks', () => {
    const maximums = getSeasonalMaximums(
      counts([
        ['2019-03-04', null],
        ['2018-03-05', 0],
      ]),
      '2023-11-09'
    );
    expect(maximums.size).toBe(0);
  });
});

describe('getSeasonalMaximum', () => {
  const maximums = new Map([
    ['Christmas', 105_674],
    ['week-44', 213_703],
  ]);

  it('looks up the season of any date and names a holiday week', () => {
    expect(getSeasonalMaximum(maximums, '2025-12-22')).toEqual({
      value: 105_674,
      season: 'Christmas week',
    });
    expect(getSeasonalMaximum(maximums, '2026-10-26')).toEqual({
      value: 213_703,
      season: 'this time of year',
    });
  });

  it('has nothing for a season without history', () => {
    expect(getSeasonalMaximum(maximums, '2026-07-06')).toBeUndefined();
  });
});
