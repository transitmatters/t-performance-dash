import { describe, expect, it } from 'vitest';
import type { WeatherHourly } from '../../../common/types/weather';
import { describeWeather, weatherRows } from './weatherDetails';

const hour = (
  weather_code: number,
  condition: WeatherHourly['condition'],
  precipitation_in: number | null = null,
  wind_mph: number | null = null
): WeatherHourly => ({
  timestamp: '2026-02-07T05:00:00',
  temperature_f: 24,
  weather_code,
  condition,
  precipitation_in,
  humidity_pct: null,
  wind_mph,
});

describe('describeWeather', () => {
  it('names the range of intensities', () => {
    const hours = [hour(71, 'snow'), hour(73, 'snow'), hour(71, 'snow')];
    expect(describeWeather(hours, 'snow')).toBe('Light to moderate snow');
    expect(describeWeather([hour(65, 'rain')], 'rain')).toBe('Heavy rain');
  });

  it('keeps a single kind, and falls back to the condition when kinds mix', () => {
    expect(describeWeather([hour(81, 'rain')], 'rain')).toBe('Moderate rain showers');
    expect(describeWeather([hour(61, 'rain'), hour(81, 'rain')], 'rain')).toBe(
      'Light to moderate rain'
    );
  });

  it('leaves out intensity when the codes have none', () => {
    expect(describeWeather([hour(95, 'storm')], 'storm')).toBe('Thunderstorm');
    expect(describeWeather([hour(45, 'fog'), hour(48, 'fog')], 'fog')).toBe('Fog');
  });
});

describe('weatherRows', () => {
  it('totals precipitation and finds the peak wind', () => {
    const hours = [hour(63, 'rain', 0.1, 8), hour(63, 'rain', 0.15, 12.4)];
    expect(weatherRows(hours, 'rain')).toEqual([
      { label: 'Precipitation', value: '0.25 in' },
      { label: 'Wind', value: 'Up to 12 mph' },
    ]);
  });

  it('estimates snow depth from the snow hours alone', () => {
    const hours = [hour(73, 'snow', 0.12), hour(73, 'snow', 0.08), hour(3, 'cloudy', 0.05)];
    expect(weatherRows(hours, 'snow')).toEqual([{ label: 'Snowfall', value: '≈ 2 in' }]);
    expect(weatherRows([hour(71, 'snow', 0.02)], 'snow')).toEqual([
      { label: 'Snowfall', value: 'Under ½ in' },
    ]);
  });

  it('skips rows that were never reported', () => {
    expect(weatherRows([hour(45, 'fog', 0, null)], 'fog')).toEqual([]);
  });
});
