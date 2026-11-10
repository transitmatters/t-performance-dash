import { describe, expect, it } from 'vitest';

import { formatPercent, formatPercentChange, halvesDetail, statDelta } from './statDelta';

describe('formatPercentChange', () => {
  it('shows a share difference as a signed whole percentage', () => {
    expect(formatPercentChange(0.13)).toBe('+13%');
    expect(formatPercentChange(-0.126)).toBe('-13%');
  });

  it('leaves the sign off a change that rounds to zero', () => {
    expect(formatPercentChange(0.004)).toBe('0%');
  });

  it('can drop the sign', () => {
    expect(formatPercentChange(0.13, { signed: false })).toBe('13%');
  });
});

describe('halvesDetail', () => {
  it('names both values and what they compare', () => {
    expect(halvesDetail(0.2, 0.33, formatPercent)).toBe(
      '20% → 33%, first half vs. second half of the selected dates'
    );
  });

  it('is empty when either half is missing', () => {
    expect(halvesDetail(NaN, 0.33, formatPercent)).toBeUndefined();
  });
});

describe('statDelta', () => {
  const base = { negligible: 0.005, words: ['better', 'worse'] as [string, string] };

  it('reads a rise as good by default', () => {
    expect(statDelta({ ...base, delta: 0.13, magnitude: '+13%' })).toEqual({
      label: '+13% · better',
      sentiment: 'good',
      detail: undefined,
    });
  });

  it('reads a rise as bad when lower is better', () => {
    expect(
      statDelta({ ...base, delta: 0.4, magnitude: '+0.4 yrs', higherIsBetter: false })
    ).toMatchObject({ label: '+0.4 yrs · worse', sentiment: 'bad' });
  });

  it('reads a negligible change as flat', () => {
    expect(statDelta({ ...base, delta: 0.004, magnitude: '0%' })).toMatchObject({
      label: '0% · flat',
      sentiment: 'flat',
    });
  });

  it('omits the word when none is given', () => {
    expect(statDelta({ delta: 0.13, negligible: 0.005, magnitude: '+13%' })?.label).toBe('+13%');
  });

  it('returns nothing for a missing delta', () => {
    expect(statDelta({ ...base, delta: NaN, magnitude: '' })).toBeUndefined();
  });
});
