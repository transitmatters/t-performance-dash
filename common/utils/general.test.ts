import { describe, expect, it } from 'vitest';
import { hexWithAlpha } from './general';

describe('hexWithAlpha', () => {
  it('draws an alpha of 0 transparent, not opaque', () => {
    expect(hexWithAlpha('#da291c', 0)).toBe('#da291c00');
  });

  it('pads small alphas to two hex digits', () => {
    expect(hexWithAlpha('#da291c', 0.02)).toBe('#da291c05');
  });

  it('clamps to the 0 to 1 range', () => {
    expect(hexWithAlpha('#da291c', 0.5)).toBe('#da291c80');
    expect(hexWithAlpha('#da291c', 2)).toBe('#da291cFF');
    expect(hexWithAlpha('#da291c', -1)).toBe('#da291c00');
  });

  it('draws a missing alpha opaque', () => {
    expect(hexWithAlpha('#da291c', NaN)).toBe('#da291cFF');
  });
});
