import { describe, expect, it } from 'vitest';

import type { RidershipCount } from '../../../common/types/dataPoints';
import { getRidershipStats } from './utils';

describe('getRidershipStats', () => {
  it('reads the share of the historical maximum from the newest week with a count', () => {
    const ridership = [
      { date: '2026-10-19', count: 400 },
      { date: '2026-10-26', count: 500 },
      { date: '2026-11-02', count: null },
    ] as unknown as RidershipCount[];
    expect(getRidershipStats(ridership, 1000).percentage).toBe(0.5);
  });

  it('compares the newest week with the same week of past years when it can', () => {
    const ridership = [
      { date: '2025-12-15', count: 106_107 },
      { date: '2025-12-22', count: 64_879 },
    ] as unknown as RidershipCount[];
    const christmas = { value: 105_674, season: 'Christmas week' };
    const stats = getRidershipStats(ridership, 211_886, (date) =>
      date === '2025-12-22' ? christmas : undefined
    );
    expect(stats.percentage).toBeCloseTo(0.614, 3);
    expect(stats.seasonalPeak).toBe(christmas);
  });

  it('falls back to the all-time maximum for a week without seasonal history', () => {
    const ridership = [{ date: '2026-07-06', count: 105_943 }] as unknown as RidershipCount[];
    const stats = getRidershipStats(ridership, 211_886, () => undefined);
    expect(stats.percentage).toBe(0.5);
    expect(stats.seasonalPeak).toBeUndefined();
  });
});
