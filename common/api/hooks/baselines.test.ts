import { describe, expect, it } from 'vitest';

import { flatRidershipMaximum } from './baselines';

describe('flatRidershipMaximum', () => {
  const line = { isStation: false, hasSeasonal: false };

  it("draws the line's all-time maximum", () => {
    expect(flatRidershipMaximum(213_703, line)).toBe(213_703);
  });

  it('draws none for a line without a maximum, as for a held-back baseline', () => {
    expect(flatRidershipMaximum(undefined, line)).toBe(0);
  });

  it('draws none for a station, or with the maximum for the time of year instead', () => {
    expect(flatRidershipMaximum(213_703, { ...line, isStation: true })).toBe(0);
    expect(flatRidershipMaximum(213_703, { ...line, hasSeasonal: true })).toBe(0);
  });
});
