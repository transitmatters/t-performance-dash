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
});
