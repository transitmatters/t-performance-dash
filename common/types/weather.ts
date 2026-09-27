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

export type WeatherHourly = {
  timestamp: string;
  temperature_f: number | null;
  weather_code: number | null;
  condition: WeatherCondition | null;
  precipitation_in: number | null;
  humidity_pct: number | null;
  wind_mph: number | null;
};
