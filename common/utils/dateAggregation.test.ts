import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { DatedValue } from './dateAggregation';
import { getTrailingWindowDelta, getYearOverYearDelta } from './dateAggregation';

/** Monday-dated weekly points, oldest first, ending on `end`. */
const weekly = (end: string, weeks: number, value: (weeksAgo: number) => number): DatedValue[] =>
  Array.from({ length: weeks }, (_, i) => {
    const weeksAgo = weeks - 1 - i;
    return {
      date: dayjs(end).subtract(weeksAgo, 'week').format('YYYY-MM-DD'),
      value: value(weeksAgo),
    };
  });

// 2026-10-26 is a Monday, as the bus ridership feed's latest record was on 2026-11-09.
const END = '2026-10-26';

describe('getTrailingWindowDelta', () => {
  it('compares the last 30 days with the 30 before them', () => {
    // Five Mondays in each window: 0-4 weeks back, then 5-8 (week 9 is 63 days back).
    const points = weekly(END, 20, (weeksAgo) => (weeksAgo <= 4 ? 120 : 100));
    expect(getTrailingWindowDelta(points, 'avg', 30)).toEqual({
      current: 120,
      prior: 100,
      delta: 20,
      percentChange: 0.2,
    });
  });
});

describe('getYearOverYearDelta', () => {
  it('compares with the same weeks 52 weeks earlier', () => {
    const points = weekly(END, 60, (weeksAgo) => (weeksAgo <= 4 ? 110 : weeksAgo >= 52 ? 100 : 50));
    const result = getYearOverYearDelta(points, 'avg', 30);
    expect(result.current).toBe(110);
    expect(result.prior).toBe(100);
    expect(result.percentChange).toBeCloseTo(0.1);
  });

  it('counts a series whose first point is the first week of the earlier window', () => {
    // 52-56 weeks back is the earlier window, so 57 points reach exactly its first Monday.
    const points = weekly(END, 57, () => 100);
    expect(getYearOverYearDelta(points, 'avg', 30).prior).toBe(100);
  });

  it('has no prior when the series starts partway through the earlier window', () => {
    const points = weekly(END, 56, () => 100);
    expect(getYearOverYearDelta(points, 'avg', 30)).toEqual({
      current: 100,
      prior: null,
      delta: null,
      percentChange: null,
    });
  });

  it('has no prior for a series under a year old', () => {
    expect(
      getYearOverYearDelta(
        weekly(END, 20, () => 100),
        'avg',
        30
      ).prior
    ).toBeNull();
  });

  it('handles an empty series', () => {
    expect(getYearOverYearDelta([], 'avg', 30).current).toBeNaN();
  });
});
