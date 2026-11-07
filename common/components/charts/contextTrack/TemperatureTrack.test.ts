import { describe, expect, it } from 'vitest';
import { temperatureScale } from './TemperatureTrack';

describe('temperatureScale', () => {
  it('keeps 0–100 °F when readings fall inside it', () => {
    expect(temperatureScale(33, 65)).toEqual({ min: 0, max: 100 });
  });

  it('widens to fit readings below zero or above 100', () => {
    expect(temperatureScale(-10, 20)).toEqual({ min: -10, max: 100 });
    expect(temperatureScale(70, 103)).toEqual({ min: 0, max: 103 });
  });
});
