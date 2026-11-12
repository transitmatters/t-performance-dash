import { describe, expect, it } from 'vitest';
import { getSlowZoneLabelSeconds } from './labels';

const zone = { baseline: 120, delay: 30, latest_delay: 45 };

describe('getSlowZoneLabelSeconds', () => {
  it('shows the median delay for a past day', () => {
    expect(getSlowZoneLabelSeconds(zone, 'slow', false)).toBe(30);
    expect(getSlowZoneLabelSeconds(zone, 'travel', false)).toBe(150);
  });

  it('shows the latest day for today', () => {
    expect(getSlowZoneLabelSeconds(zone, 'slow', true)).toBe(45);
    expect(getSlowZoneLabelSeconds(zone, 'travel', true)).toBe(165);
  });

  it('falls back to the median when the latest delay is missing', () => {
    const noLatest = { ...zone, latest_delay: null };
    expect(getSlowZoneLabelSeconds(noLatest, 'slow', true)).toBe(30);
    expect(getSlowZoneLabelSeconds(noLatest, 'travel', true)).toBe(150);
  });
});
