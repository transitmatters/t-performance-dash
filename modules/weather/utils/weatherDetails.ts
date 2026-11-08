import type { WeatherCondition, WeatherHourly } from '../../../common/types/weather';
import type { HoverCardRow } from '../../../common/components/charts/hoverCard/types';

type Intensity = 1 | 2 | 3;

const INTENSITY_WORDS: Record<Intensity, string> = { 1: 'light', 2: 'moderate', 3: 'heavy' };

// The significant WMO weather codes Open-Meteo reports, and how the ingestor groups them
// https://open-meteo.com/en/docs — "WMO Weather interpretation codes"
const WMO_CODES: Record<number, { kind: string; intensity?: Intensity }> = {
  45: { kind: 'fog' },
  48: { kind: 'freezing fog' },
  51: { kind: 'drizzle', intensity: 1 },
  53: { kind: 'drizzle', intensity: 2 },
  55: { kind: 'drizzle', intensity: 3 },
  56: { kind: 'freezing drizzle', intensity: 1 },
  57: { kind: 'freezing drizzle', intensity: 3 },
  61: { kind: 'rain', intensity: 1 },
  63: { kind: 'rain', intensity: 2 },
  65: { kind: 'rain', intensity: 3 },
  66: { kind: 'freezing rain', intensity: 1 },
  67: { kind: 'freezing rain', intensity: 3 },
  71: { kind: 'snow', intensity: 1 },
  73: { kind: 'snow', intensity: 2 },
  75: { kind: 'snow', intensity: 3 },
  77: { kind: 'snow grains' },
  80: { kind: 'rain showers', intensity: 1 },
  81: { kind: 'rain showers', intensity: 2 },
  82: { kind: 'rain showers', intensity: 3 },
  85: { kind: 'snow showers', intensity: 1 },
  86: { kind: 'snow showers', intensity: 3 },
  95: { kind: 'thunderstorm' },
  96: { kind: 'thunderstorm with hail' },
  99: { kind: 'thunderstorm with hail' },
};

// What to call a run whose hours mix kinds, like rain and rain showers
const CONDITION_NOUNS: Partial<Record<WeatherCondition, string>> = {
  rain: 'rain',
  snow: 'snow',
  fog: 'fog',
  storm: 'thunderstorm',
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Names a run of weather from its hours' WMO codes, with the range of intensities it went
 * through: "Light to moderate snow", "Heavy rain showers", "Thunderstorm".
 */
export const describeWeather = (hours: WeatherHourly[], condition: WeatherCondition): string => {
  const codes = hours
    .filter((hour) => hour.condition === condition && hour.weather_code !== null)
    .map((hour) => WMO_CODES[hour.weather_code as number])
    .filter(Boolean);
  const kinds = new Set(codes.map(({ kind }) => kind));
  const noun =
    kinds.size === 1 ? [...kinds][0] : (CONDITION_NOUNS[condition] ?? condition.toString());
  const intensities = codes.flatMap(({ intensity }) => (intensity ? [intensity] : []));
  if (!intensities.length) return capitalize(noun);
  const low = Math.min(...intensities) as Intensity;
  const high = Math.max(...intensities) as Intensity;
  const range =
    low === high ? INTENSITY_WORDS[low] : `${INTENSITY_WORDS[low]} to ${INTENSITY_WORDS[high]}`;
  return capitalize(`${range} ${noun}`);
};

const readings = (hours: WeatherHourly[], field: 'precipitation_in' | 'wind_mph') =>
  hours.flatMap((hour) => (hour[field] === null ? [] : [hour[field]]));

// Open-Meteo reports snow as the water it melts to. Ten inches of snow to one of water is the usual
// rule of thumb; real snow runs from about 5:1 when wet to 20:1 when powdery.
const SNOW_TO_WATER = 10;

const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

/**
 * Total precipitation and peak wind across the hours, when they were reported. Snow shows as a
 * rough depth from the snow hours alone, to the nearest half inch.
 */
export const weatherRows = (hours: WeatherHourly[], condition: WeatherCondition) => {
  const rows: HoverCardRow[] = [];
  if (condition === 'snow') {
    const snowHours = hours.filter((hour) => hour.condition === 'snow');
    const water = total(readings(snowHours, 'precipitation_in'));
    const depth = Math.round(water * SNOW_TO_WATER * 2) / 2;
    if (water > 0) {
      rows.push({ label: 'Snowfall', value: depth < 0.5 ? 'Under ½ in' : `≈ ${depth} in` });
    }
  } else {
    const water = total(readings(hours, 'precipitation_in'));
    if (water > 0) {
      rows.push({
        label: 'Precipitation',
        value: water < 0.01 ? '< 0.01 in' : `${water.toFixed(2)} in`,
      });
    }
  }
  const wind = readings(hours, 'wind_mph');
  if (wind.length) {
    rows.push({ label: 'Wind', value: `Up to ${Math.round(Math.max(...wind))} mph` });
  }
  return rows;
};
