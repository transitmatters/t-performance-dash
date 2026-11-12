import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../utils/general';
import { getLineColorKey, LINE_COLORS_ON_DARK, LINE_TEXT_COLORS } from './colors';

describe('getLineColorKey', () => {
  it.each(['SL1/SL2/SL3/SLW', 'SL4/SL5'])('draws Silver Line route %s in silver', (busRoute) => {
    expect(getLineColorKey('line-bus', busRoute)).toBe('line-silver');
  });

  it('leaves other bus routes, and bus pages with no route, in bus yellow', () => {
    expect(getLineColorKey('line-bus', '1')).toBe('line-bus');
    expect(getLineColorKey('line-bus', 'CT3/171')).toBe('line-bus');
    expect(getLineColorKey('line-bus', undefined)).toBe('line-bus');
  });

  it('only applies to bus pages', () => {
    expect(getLineColorKey('line-red', 'SL1/SL2/SL3/SLW')).toBe('line-red');
    expect(getLineColorKey(undefined, 'SL1/SL2/SL3/SLW')).toBeUndefined();
  });
});

describe('Silver Line text colors', () => {
  it('read at 4.5:1 or better on light and dark cards', () => {
    expect(contrastRatio(LINE_TEXT_COLORS['line-silver'].light, '#ffffff')).toBeGreaterThan(4.5);
    expect(contrastRatio(LINE_TEXT_COLORS['line-silver'].dark, '#171717')).toBeGreaterThan(4.5);
    expect(contrastRatio(LINE_COLORS_ON_DARK['line-silver'], '#171717')).toBeGreaterThan(4.5);
  });
});
