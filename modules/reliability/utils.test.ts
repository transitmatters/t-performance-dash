import { describe, expect, it } from 'vitest';
import type { ReliabilityEntry } from '../../common/types/dataPoints';
import {
  divergingShares,
  getHeadwayTotals,
  HEADWAY_BUCKETS,
  headwayShare,
  ON_TIME,
  toCsvRows,
  toHeadwayRows,
} from './utils';

const counts = (under50: number, c50: number, c75: number, c125: number, over150: number) => ({
  headways_under_50: under50,
  headways_50_75: c50,
  headways_75_125: c75,
  headways_125_150: c125,
  headways_over_150: over150,
});

const data: ReliabilityEntry[] = [
  {
    date: '2026-10-05',
    days: 7,
    ...counts(10, 20, 40, 10, 20),
    byDirection: { '0': counts(4, 6, 30, 5, 5), '1': counts(6, 14, 10, 5, 15) },
  },
  { date: '2026-10-12', days: 7, ...counts(0, 0, 0, 0, 0) },
];

const bucket = (field: string) => HEADWAY_BUCKETS.find((b) => b.field === field)!;

describe('toHeadwayRows', () => {
  it('uses the totals for both directions', () => {
    expect(headwayShare(toHeadwayRows(data, 'both')[0].counts, ON_TIME)).toBe(40);
  });

  it("uses one direction's counts", () => {
    expect(headwayShare(toHeadwayRows(data, '0')[0].counts, ON_TIME)).toBe(60);
    expect(headwayShare(toHeadwayRows(data, '1')[0].counts, ON_TIME)).toBe(20);
  });

  it('leaves a period without direction counts empty', () => {
    expect(toHeadwayRows(data, '1')[1].counts).toBeUndefined();
  });
});

describe('getHeadwayTotals', () => {
  it('adds up counts across periods', () => {
    expect(getHeadwayTotals(toHeadwayRows(data, '0'))).toEqual(counts(4, 6, 30, 5, 5));
  });
});

describe('divergingShares', () => {
  const rows = toHeadwayRows(data, 'both');

  it('puts headways shorter than scheduled below zero', () => {
    expect(divergingShares(rows, bucket('headways_under_50'))).toEqual([-10, null]);
    expect(divergingShares(rows, bucket('headways_50_75'))).toEqual([-20, null]);
  });

  it('puts headways longer than scheduled above zero', () => {
    expect(divergingShares(rows, bucket('headways_over_150'))).toEqual([20, null]);
  });
});

describe('toCsvRows', () => {
  it('keeps only the date and headway counts', () => {
    expect(toCsvRows(toHeadwayRows(data, 'both'))[0]).toEqual({
      date: '2026-10-05',
      ...counts(10, 20, 40, 10, 20),
    });
  });
});
