import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { dailyTemperatureOn, temperatureAt } from './temperatureDataset';

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
