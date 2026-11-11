import { describe, expect, it } from 'vitest';

import type { TimePredictionWeek } from '../../../common/types/dataPoints';
import red from '../../../server/tests/fixtures/api_samples/time_predictions/red.json';
import { getPredictionStats } from './utils';

describe('getPredictionStats', () => {
  const stats = getPredictionStats(red as TimePredictionWeek[]);

  it('picks the best and worst whole weeks, not single bins', () => {
    expect(stats.peakAccuracy).toBeCloseTo(0.938, 3);
    expect(stats.worstAccuracy).toBeCloseTo(0.87, 3);
  });

  it('dates them by week', () => {
    expect(stats.peakDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(stats.worstDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
