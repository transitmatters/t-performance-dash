import { describe, expect, it } from 'vitest';
import type { HeadwayPoint } from '../../../common/types/dataPoints';
import { getHeadwayBuckets } from './utils';

const trip = (headwaySec: number, benchmarkSec: number | null): HeadwayPoint => ({
  route_id: 'Red',
  direction: 0,
  prev_route_id: 'Red',
  current_dep_dt: '2026-11-03T08:00:00',
  previous_dep_dt: '2026-11-03T07:50:00',
  headway_time_sec: headwaySec,
  benchmark_headway_time_sec: benchmarkSec,
});

describe('getHeadwayBuckets', () => {
  it("compares each bucket with its own trips' benchmarks, not the day's first trip", () => {
    const buckets = getHeadwayBuckets([
      // Early morning, scheduled every 12 minutes
      trip(12 * 60 + 10, 12 * 60),
      // Peak, scheduled every 6 minutes
      trip(6 * 60 + 5, 6 * 60),
      trip(6 * 60 + 40, 6 * 60),
    ]);
    expect(buckets['6.5'].benchmark).toEqual({ median: 360, min: 360, max: 360 });
    expect(buckets['12.5'].benchmark).toEqual({ median: 720, min: 720, max: 720 });
  });

  it('gives the median and spread when a bucket holds trips on different schedules', () => {
    const buckets = getHeadwayBuckets([
      trip(8 * 60, 6 * 60),
      trip(8 * 60 + 20, 8 * 60),
      trip(8 * 60 + 30, 12 * 60),
      trip(8 * 60 + 50, 12 * 60),
    ]);
    expect(buckets['8.5']).toEqual({
      count: 4,
      pctTrips: 100,
      benchmark: { median: 600, min: 360, max: 720 },
    });
  });

  it('fills empty buckets and leaves out missing benchmarks', () => {
    const buckets = getHeadwayBuckets([trip(30, null), trip(3 * 60, 0), trip(-5, 300)]);
    expect(Object.keys(buckets)).toEqual(['0.5', '1.5', '2.5', '3.5']);
    expect(buckets['1.5']).toEqual({ count: 0, pctTrips: 0, benchmark: undefined });
    expect(buckets['0.5'].benchmark).toBeUndefined();
    expect(buckets['3.5'].benchmark).toBeUndefined();
  });
});
