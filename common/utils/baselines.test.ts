import { describe, expect, it } from 'vitest';

import type { HistoricalBaselines } from '../types/baselines';
import { getBaseline } from './baselines';

const baselines = {
  schemaVersion: 1,
  generatedAt: '2026-11-16T16:28:08+00:00',
  cutoff: '2023-11-16',
  metrics: {
    speed: {
      unit: 'mph',
      series: {
        'line-orange': { value: 18.13, bestWindow: null },
        'line-green': { value: null, bestWindow: null },
      },
    },
  },
} satisfies HistoricalBaselines;

describe('getBaseline', () => {
  it('prefers the published value over the fallback', () => {
    expect(getBaseline(baselines, 'speed', 'line-orange', 19.9)).toBe(18.13);
  });

  it('falls back when the series is missing, held back, or the file failed to load', () => {
    expect(getBaseline(baselines, 'speed', 'line-green', 12.53)).toBe(12.53);
    expect(getBaseline(baselines, 'speed', 'line-red', 21.2)).toBe(21.2);
    expect(getBaseline(null, 'speed', 'line-orange', 18.13)).toBe(18.13);
  });

  it('returns undefined for a series with no baseline and no fallback', () => {
    expect(getBaseline(baselines, 'speed', 'line-bus', undefined)).toBeUndefined();
  });
});
