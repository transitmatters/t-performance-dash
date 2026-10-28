import { describe, expect, it } from 'vitest';
import type { BusSpeedSegmentLeaderboardEntry } from './types';
import { segmentDistanceAndTime } from './utils';

const entry = (
  overrides: Partial<BusSpeedSegmentLeaderboardEntry> = {}
): BusSpeedSegmentLeaderboardEntry => ({
  route_id: '28',
  direction_id: 1,
  from_stop_name: 'A',
  to_stop_name: 'B',
  p50_speed_mph: 4.0,
  n_traversals: 40,
  n_interpolated: 0,
  ...overrides,
});

describe('segmentDistanceAndTime', () => {
  it('formats miles and minutes', () => {
    expect(
      segmentDistanceAndTime(entry({ segment_length_m: 402, p50_total_time_seconds: 112 }))
    ).toBe('0.25 mi · 1m 52s');
  });

  it('keeps short times in seconds', () => {
    expect(
      segmentDistanceAndTime(entry({ segment_length_m: 161, p50_total_time_seconds: 45 }))
    ).toBe('0.10 mi · 45s');
  });

  it('is undefined for files published without the fields', () => {
    expect(segmentDistanceAndTime(entry())).toBeUndefined();
    expect(segmentDistanceAndTime(entry({ segment_length_m: 402 }))).toBeUndefined();
    expect(segmentDistanceAndTime(entry({ p50_total_time_seconds: 112 }))).toBeUndefined();
  });
});
