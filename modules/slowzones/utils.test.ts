import { describe, expect, it } from 'vitest';

import { type SlowZoneStats, slowTimeBadge, zonesBadge } from './utils';

const stats = (overrides: Partial<SlowZoneStats>): SlowZoneStats => ({
  currentSlowTime: 0,
  slowTimeDelta: 0,
  activeZones: 0,
  zonesDelta: 0,
  worstSegment: null,
  ...overrides,
});

describe('slowTimeBadge', () => {
  it('compares the first and last day of the range', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 300, slowTimeDelta: 120 }))).toEqual({
      label: '+2m 00s · worse',
      sentiment: 'bad',
      detail: '3m 00s → 5m 00s, start vs. end of the selected dates',
    });
  });

  it('reads less slow time as better', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 30, slowTimeDelta: -90 }))).toMatchObject({
      label: '−90s · better',
      sentiment: 'good',
    });
  });

  it('reads a change of a minute or less as flat', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 100, slowTimeDelta: 45 }))?.sentiment).toBe(
      'flat'
    );
  });
});

describe('zonesBadge', () => {
  it('compares the zone count at the start and end of the range', () => {
    expect(zonesBadge(stats({ activeZones: 3, zonesDelta: 2 }))).toEqual({
      label: '+2 · worse',
      sentiment: 'bad',
      detail: '1 → 3, start vs. end of the selected dates',
    });
  });

  it('reads no change as flat', () => {
    expect(zonesBadge(stats({ activeZones: 3, zonesDelta: 0 }))).toMatchObject({
      label: '0 · flat',
      sentiment: 'flat',
    });
  });
});
