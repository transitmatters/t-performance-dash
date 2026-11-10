import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../../common/utils/general';
import {
  TEMPERATURE_COLOR_STOPS,
  dailyTemperatureOn,
  temperatureAt,
  temperatureColor,
} from './temperatureDataset';

const at = (time: string) => dayjs(time).valueOf();

describe('temperatureAt', () => {
  const series = [
    { x: '2026-02-07T15:00:00', y: 30 },
    { x: '2026-02-07T16:00:00', y: 40 },
    { x: '2026-02-07T20:00:00', y: 20 },
  ];

  it('reads between the hourly readings', () => {
    expect(temperatureAt(series, at('2026-02-07T15:00:00'))).toBe(30);
    expect(temperatureAt(series, at('2026-02-07T15:30:00'))).toBe(35);
    expect(temperatureAt(series, at('2026-02-07T16:00:00'))).toBe(40);
  });

  it('is undefined outside the readings or across a gap', () => {
    expect(temperatureAt(series, at('2026-02-07T14:59:00'))).toBeUndefined();
    expect(temperatureAt(series, at('2026-02-07T18:00:00'))).toBeUndefined();
    expect(temperatureAt([], at('2026-02-07T15:00:00'))).toBeUndefined();
  });
});

describe('dailyTemperatureOn', () => {
  const series = {
    mean: [{ x: '2026-02-07', y: 0 }],
    min: [{ x: '2026-02-07', y: -8 }],
    max: [{ x: '2026-02-07', y: 9 }],
  };

  it('finds the day by date, including a 0 °F mean', () => {
    expect(dailyTemperatureOn(series, '2026-02-07')).toEqual({ mean: 0, low: -8, high: 9 });
    expect(dailyTemperatureOn(series, '2026-02-08')).toBeUndefined();
  });
});

describe('temperatureColor', () => {
  it('lands on each stop exactly', () => {
    expect(temperatureColor(20)).toBe('rgb(59, 130, 246)');
    expect(temperatureColor(50)).toBe('rgb(22, 163, 74)');
    expect(temperatureColor(75)).toBe('rgb(234, 88, 12)');
    expect(temperatureColor(95)).toBe('rgb(220, 38, 38)');
  });

  it('blends between stops', () => {
    // Halfway from blue (59, 130, 246) to green (22, 163, 74)
    expect(temperatureColor(35)).toBe('rgb(41, 147, 160)');
  });

  it('keeps the end colors past either end', () => {
    expect(temperatureColor(-15)).toBe('rgb(59, 130, 246)');
    expect(temperatureColor(108)).toBe('rgb(220, 38, 38)');
  });

  it.each(TEMPERATURE_COLOR_STOPS)('holds 3:1 on light and dark cards at %i °F', (_, color) => {
    expect(contrastRatio(color, '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color, '#171717')).toBeGreaterThanOrEqual(3);
  });
});
