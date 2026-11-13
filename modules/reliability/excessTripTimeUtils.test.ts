import { describe, expect, it } from 'vitest';
import type {
  ExcessTripTimeEntry,
  ExcessTripTimeScope,
  ExcessTripTimeSums,
} from '../../common/types/dataPoints';
import {
  excessTravel,
  excessTripTime,
  excessWait,
  formatMinutes,
  hasExcessTripTime,
  sumEttRows,
  toEttRows,
  withinFiveShare,
  withinTwentyShare,
} from './excessTripTimeUtils';

// 100 riders who waited 5 min (baseline 4) and rode 12 min (baseline 10.5); 90 within 5 min
const sums = (scale = 1): ExcessTripTimeSums => ({
  riders: 100 * scale,
  waitTime: 500 * scale,
  travelTime: 1200 * scale,
  baselineTripTime: 1440 * scale,
  baselineWaitTime: 400 * scale,
  baselineTravelTime: 1050 * scale,
  withinFiveMin: 90 * scale,
  withinTwentyMin: 99 * scale,
  withinTwentyPct: 80 * scale,
  withinThirtyPct: 95 * scale,
});

const scope = (scale = 1): ExcessTripTimeScope => ({
  ...sums(scale),
  byPeriod: { amPeak: sums(scale / 2), pmPeak: sums(scale / 4), offPeak: sums(scale / 4) },
});

const data: ExcessTripTimeEntry[] = [
  { date: '2026-09-07', days: 7, ...scope(2), byDirection: { '0': scope(1.5), '1': scope(0.5) } },
  { date: '2026-09-14', days: 3, ...scope(1), byDirection: { '0': scope(0.5), '1': scope(0.5) } },
];

describe('excess trip time', () => {
  it('splits excess minutes per rider into wait and travel, which add up', () => {
    expect(excessWait(sums())).toBeCloseTo(1);
    expect(excessTravel(sums())).toBeCloseTo(1.5);
    // The MBTA's formula, (wait + travel) - (baseline wait + baseline travel), not baselineTripTime
    expect(excessTripTime(sums())).toBeCloseTo(2.5);
  });

  it('is undefined with no riders, so charts show a gap', () => {
    const none = { ...sums(), riders: 0 };
    expect(excessTripTime(none)).toBeUndefined();
    expect(withinFiveShare(none)).toBeUndefined();
    expect(excessWait(undefined)).toBeUndefined();
  });

  it('reports the share of riders within each threshold', () => {
    expect(withinFiveShare(sums())).toBe(90);
    expect(withinTwentyShare(sums())).toBe(99);
  });

  it('picks both directions or one, with its own periods', () => {
    const both = toEttRows(data, 'both');
    expect(both[0].sums?.riders).toBe(200);
    const northbound = toEttRows(data, '1');
    expect(northbound[0].sums?.riders).toBe(50);
    expect(northbound[0].sums?.byPeriod.amPeak.riders).toBe(25);
  });

  it('sums rows before averaging, so a short week weighs less', () => {
    const totals = sumEttRows(toEttRows(data, 'both'));
    expect(totals.riders).toBe(300);
    expect(totals.days).toBe(10);
    expect(withinFiveShare(totals)).toBe(90);
    expect(excessTripTime(totals)).toBeCloseTo(2.5);
  });

  it('formats signed minutes', () => {
    expect(formatMinutes(1.64)).toBe('+1.6');
    expect(formatMinutes(-0.44)).toBe('−0.4');
    expect(formatMinutes(-0.04)).toBe('0.0');
    expect(formatMinutes(undefined)).toBe('—');
  });

  it('is published for the Red, Orange and Blue Lines only', () => {
    expect(hasExcessTripTime('line-red')).toBe(true);
    expect(hasExcessTripTime('line-blue')).toBe(true);
    expect(hasExcessTripTime('line-green')).toBe(false);
    expect(hasExcessTripTime('line-mattapan')).toBe(false);
    expect(hasExcessTripTime(undefined)).toBe(false);
  });
});
