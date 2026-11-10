import { describe, expect, it } from 'vitest';

import type { AggregateDataPoint } from '../../../common/types/charts';
import { convertToAggregateStationSpeedDataset } from './stationSpeed';

const day: AggregateDataPoint = {
  '25%': 60,
  '50%': 90,
  '75%': 120,
  min: 45,
  max: 300,
  mean: 100,
  std: 30,
  count: 10,
  service_date: '2026-10-01',
};

describe('convertToAggregateStationSpeedDataset', () => {
  const [speed] = convertToAggregateStationSpeedDataset('place-wondl', 'place-rbmnl', [day]);

  it('keeps the percentiles in ascending order', () => {
    expect(speed['25%']).toBeLessThan(speed['50%']);
    expect(speed['50%']).toBeLessThan(speed['75%']);
  });

  it('takes the min speed from the slowest trip and the max from the fastest', () => {
    expect(speed.min).toBeLessThan(speed.max);
    expect(speed.max).toBeCloseTo((3600 * 0.386049255473037) / 45);
  });

  it('leaves off std, which has no mph equivalent', () => {
    expect(speed).not.toHaveProperty('std');
    expect(speed.service_date).toBe('2026-10-01');
  });
});
