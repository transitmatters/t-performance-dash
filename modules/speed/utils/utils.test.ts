import { describe, expect, it } from 'vitest';

import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { getSpeedStats } from './utils';

const period = (date: string, miles: number, hours: number) =>
  ({
    date,
    line: 'line-red',
    miles_covered: miles,
    total_time: hours * 3600,
  }) as DeliveredTripMetrics;

describe('getSpeedStats', () => {
  // A full week at 20 mph, then a one-day partial week at 30 mph.
  const data = [period('2026-10-05', 2000, 100), period('2026-10-12', 30, 1)];

  it('weights the average by time, so a partial period counts for less', () => {
    const stats = getSpeedStats(data, 25);
    expect(stats.avgSpeed).toBeCloseTo(2030 / 101);
    expect(stats.peakSpeed).toBe(30);
  });

  it('uses the baseline it is given for the share of historical max', () => {
    expect(getSpeedStats(data, 25).percentOfMax).toBeCloseTo(2030 / 101 / 25);
    expect(getSpeedStats(data, 0).percentOfMax).toBeNaN();
  });

  it('leaves out periods with no trips', () => {
    const stats = getSpeedStats([...data, period('2026-10-19', 0, 0)], 25);
    expect(stats.avgSpeed).toBeCloseTo(2030 / 101);
  });
});
