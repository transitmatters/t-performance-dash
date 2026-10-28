import { describe, expect, it } from 'vitest';

import { severityForRatio } from './chartTheme';

describe('severityForRatio', () => {
  it.each([
    [1, 'onTime', null],
    [1.25, 'onTime', null],
    [1.3, 'off25', '25%+ over'],
    [1.5, 'off25', '25%+ over'],
    [1.9, 'off50', '50%+ over'],
    [2.5, 'off100', '100%+ over'],
    // Fast runs are normal unless the chart flags them
    [0.3, 'onTime', null],
  ])('buckets a ratio of %s as %s', (ratio, tone, label) => {
    expect(severityForRatio(ratio)).toEqual({ tone, label });
  });

  it.each([
    [0.02, 'off100', '50%+ under'],
    [0.4, 'off50', '50%+ under'],
    [0.7, 'off25', '25%+ under'],
    [0.9, 'onTime', null],
    [1.6, 'off50', '50%+ over'],
  ])('with showUnderRatio, buckets %s as %s', (ratio, tone, label) => {
    expect(severityForRatio(ratio, true)).toEqual({ tone, label });
  });

  it('has nothing to say without a usable ratio', () => {
    expect(severityForRatio(Infinity)).toBeNull();
    expect(severityForRatio(NaN)).toBeNull();
  });
});
