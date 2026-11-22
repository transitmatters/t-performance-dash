import type { FetchWeatherOptions } from '../types/api';
import type { WeatherCondition, WeatherHourly } from '../types/weather';
import { WEATHER_CONDITIONS } from '../types/weather';
import { apiFetch } from './utils/fetch';

const isWeatherCondition = (value: string): value is WeatherCondition =>
  WEATHER_CONDITIONS.some((condition) => condition === value);

export const fetchWeather = async (options: FetchWeatherOptions): Promise<WeatherHourly[]> => {
  const hours = await apiFetch({
    path: '/api/weather',
    options,
    errorMessage: 'Failed to fetch weather data',
  });
  return hours.map((hour) => ({
    timestamp: hour.timestamp,
    temperature_f: hour.temperature_f ?? null,
    weather_code: hour.weather_code ?? null,
    condition:
      hour.condition == null || isWeatherCondition(hour.condition)
        ? (hour.condition ?? null)
        : 'unknown',
    precipitation_in: hour.precipitation_in ?? null,
    humidity_pct: hour.humidity_pct ?? null,
    wind_mph: hour.wind_mph ?? null,
  }));
};
