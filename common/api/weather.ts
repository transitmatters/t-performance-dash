import type { FetchWeatherOptions } from '../types/api';
import type { WeatherHourly } from '../types/weather';
import { apiFetch } from './utils/fetch';

export const fetchWeather = async (options: FetchWeatherOptions): Promise<WeatherHourly[]> =>
  apiFetch({
    path: '/api/weather',
    options,
    errorMessage: 'Failed to fetch weather data',
  });
