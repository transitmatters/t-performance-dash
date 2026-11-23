import type { Filled, Schemas } from './apiSchemas';

export const WEATHER_CONDITIONS = [
  'clear',
  'cloudy',
  'fog',
  'rain',
  'snow',
  'storm',
  'unknown',
] as const;

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

export type WeatherHourly = Filled<Schemas['WeatherHourlyEntry']> & {
  condition: WeatherCondition | null;
};
