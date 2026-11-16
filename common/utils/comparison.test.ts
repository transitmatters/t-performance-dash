import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { AggregateDataPoint } from '../types/charts';
import { PointFieldKeys } from '../types/charts';
import type { TripComparison } from '../types/comparison';
import {
  alignComparisonSeries,
  comparisonDateFor,
  getComparisonPeriod,
  getComparisonSeries,
  getDefaultCustomCompareDate,
} from './comparison';

const point = (fields: Partial<AggregateDataPoint>, median: number): AggregateDataPoint => ({
  '25%': median,
  '50%': median,
  '75%': median,
  count: 1,
  max: median,
  mean: median,
  min: median,
  std: 0,
  ...fields,
});
const day = (date: string, median: number) => point({ service_date: date }, median);

describe('getComparisonPeriod', () => {
  it('takes the range just before for `previous`', () => {
    expect(getComparisonPeriod('2026-09-01', '2026-10-31', 'previous')).toMatchObject({
      option: 'previous',
      startDate: '2026-07-02',
      endDate: '2026-08-31',
      offsetDays: 61,
      rangeLabel: 'Jul 2 – Aug 31, 2026',
    });
  });

  it('goes back 52 weeks for `year`, so each day keeps its weekday', () => {
    const period = getComparisonPeriod('2026-09-01', '2026-10-31', 'year');
    expect(period).toMatchObject({ startDate: '2025-09-02', endDate: '2025-11-01' });
    expect(dayjs(period?.startDate).day()).toBe(dayjs('2026-09-01').day());
    expect(period?.description).toBe('the same weeks last year (Sep 2 – Nov 1, 2025)');
  });

  it('starts a custom period on the given date, keeping the length', () => {
    expect(getComparisonPeriod('2026-03-01', '2026-03-31', '2025-12-15')).toMatchObject({
      option: 'custom',
      startDate: '2025-12-15',
      endDate: '2026-01-14',
      rangeLabel: 'Dec 15, 2025 – Jan 14, 2026',
      description: 'Dec 15, 2025 – Jan 14, 2026',
    });
  });

  it.each([
    ['an unknown value', '2026-09-01', '2026-10-31', 'decade'],
    ['the selected range itself', '2026-09-01', '2026-10-31', '2026-09-01'],
    ['a missing end date', '2026-09-01', undefined, 'year'],
    ['a reversed range', '2026-10-31', '2026-09-01', 'year'],
    ['no param', '2026-09-01', '2026-10-31', undefined],
  ])('ignores %s', (_, start, end, vs) => {
    expect(getComparisonPeriod(start, end, vs)).toBeUndefined();
  });

  it('offers a calendar year back as the first custom date', () => {
    expect(getDefaultCustomCompareDate('2026-09-01')).toBe('2025-09-01');
  });
});

describe('alignComparisonSeries', () => {
  it('moves comparison days onto the selected range and pairs them by date', () => {
    const aligned = alignComparisonSeries(
      [day('2026-09-01', 1), day('2026-09-03', 3)],
      [day('2025-09-02', 10), day('2025-09-03', 20)],
      PointFieldKeys.serviceDate,
      364
    );
    expect(aligned.labels).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    expect(aligned.primary.map((p) => p?.['50%'])).toEqual([1, undefined, 3]);
    expect(aligned.comparison.map((p) => p?.['50%'])).toEqual([10, 20, undefined]);
  });

  it('lines by-hour data up without shifting it', () => {
    const at = (time: string, median: number) => point({ dep_time_from_epoch: time }, median);
    const aligned = alignComparisonSeries(
      [at('1970-01-01T05:00:00', 1)],
      [at('1970-01-01T05:00:00', 2), at('1970-01-01T05:30:00', 3)],
      PointFieldKeys.depTimeFromEpoch,
      0
    );
    expect(aligned.labels).toEqual(['1970-01-01T05:00:00', '1970-01-01T05:30:00']);
    expect(aligned.primary.map((p) => p?.['50%'])).toEqual([1, undefined]);
  });
});

it("names a hovered day by the comparison period's own date", () => {
  expect(comparisonDateFor('2026-09-01', 364)).toBe('Sep 2, 2025');
});

describe('getComparisonSeries', () => {
  const period = getComparisonPeriod('2026-09-01', '2026-10-31', 'year')!;
  const select = (response: { by_date: AggregateDataPoint[] }) => response.by_date;

  it('reports loading, error and ready', () => {
    const loading: TripComparison = { period, data: undefined, isError: false };
    const failed: TripComparison = { period, data: undefined, isError: true };
    const ready: TripComparison = {
      period,
      data: { by_date: [day('2025-09-02', 5)], by_time: [] },
      isError: false,
    };
    expect(getComparisonSeries(loading, select)?.status).toBe('loading');
    expect(getComparisonSeries(failed, select)?.status).toBe('error');
    expect(getComparisonSeries(ready, select)).toMatchObject({
      status: 'ready',
      label: 'Sep 2 – Nov 1, 2025',
      offsetDays: 364,
    });
  });

  it('does not shift a by-hour chart', () => {
    const ready: TripComparison = { period, data: { by_date: [], by_time: [] }, isError: false };
    expect(getComparisonSeries(ready, select, false)?.offsetDays).toBe(0);
  });

  it('is nothing without a comparison', () => {
    expect(getComparisonSeries(undefined, select)).toBeUndefined();
  });
});
