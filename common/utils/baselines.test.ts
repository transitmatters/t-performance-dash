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
        'line-green': { value: null, bestWindow: null, insufficientHistory: true },
      },
    },
    ridership: {
      unit: 'riders per weekday',
      series: {
        'line-Fairmount': {
          value: null,
          bestWindow: null,
          candidateValue: 3598,
          heldBack: 'noPrePandemicHistory',
        },
      },
    },
  },
} satisfies HistoricalBaselines;

describe('getBaseline', () => {
  it('prefers the published value over the fallback', () => {
    expect(getBaseline(baselines, 'speed', 'line-orange', 19.9)).toBe(18.13);
  });

  it('falls back when the series is missing, has too little history, or the file failed to load', () => {
    expect(getBaseline(baselines, 'speed', 'line-green', 12.53)).toBe(12.53);
    expect(getBaseline(baselines, 'speed', 'line-red', 21.2)).toBe(21.2);
    expect(getBaseline(null, 'speed', 'line-orange', 18.13)).toBe(18.13);
  });

  it('has no baseline for a held-back series, rather than the hard-coded peak or the candidate', () => {
    expect(getBaseline(baselines, 'ridership', 'line-Fairmount', 2652)).toBeUndefined();
  });

  it('uses the held-back fallback for a held-back series when given one', () => {
    expect(getBaseline(baselines, 'ridership', 'line-Fairmount', 2652, 2652)).toBe(2652);
    expect(getBaseline(baselines, 'speed', 'line-green', 12.53, 0)).toBe(12.53);
  });

  it('returns undefined for a series with no baseline and no fallback', () => {
    expect(getBaseline(baselines, 'speed', 'line-bus', undefined)).toBeUndefined();
  });
});
