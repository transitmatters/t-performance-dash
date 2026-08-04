import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { WeatherCondition, WeatherHourly } from '../../../common/types/weather';
import { hexWithAlpha } from '../../../common/utils/general';

export type WeatherAnnotationGranularity = 'hourly' | 'daily';

export type WeatherAnnotationOptions = {
  granularity?: WeatherAnnotationGranularity;
};

export type SignificantCondition = Exclude<WeatherCondition, 'clear' | 'cloudy' | 'unknown'>;

// Ordered from least to most severe for consistent legend display.
export const SIGNIFICANT_CONDITIONS: readonly SignificantCondition[] = [
  'rain',
  'fog',
  'snow',
  'storm',
] as const;

export const WEATHER_COLORS: Record<SignificantCondition, string> = {
  rain: hexWithAlpha('#60a5fa', 0.35),
  snow: hexWithAlpha('#cbd5e1', 0.55),
  fog: hexWithAlpha('#9ca3af', 0.3),
  storm: hexWithAlpha('#7c3aed', 0.4),
};

// Higher-severity conditions win when coalescing a day's worth of hours down
// to a single category.
const SEVERITY: Record<SignificantCondition, number> = {
  storm: 4,
  snow: 3,
  fog: 2,
  rain: 1,
};

const SIGNIFICANT_SET: ReadonlySet<SignificantCondition> = new Set(SIGNIFICANT_CONDITIONS);

const isSignificant = (
  h: WeatherHourly
): h is WeatherHourly & { condition: SignificantCondition } =>
  h.condition !== null && SIGNIFICANT_SET.has(h.condition as SignificantCondition);

const buildBox = (
  xMin: string,
  xMax: string,
  condition: SignificantCondition
): AnnotationOptions<keyof AnnotationTypeRegistry> => ({
  type: 'box',
  xMin,
  xMax,
  backgroundColor: WEATHER_COLORS[condition],
  borderColor: 'transparent',
  borderWidth: 0,
});

const coalesceHourly = (
  hours: WeatherHourly[]
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  const boxes: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  let runStart: string | null = null;
  let runCondition: SignificantCondition | null = null;
  let runLastHour: string | null = null;

  const flush = () => {
    if (runStart && runCondition && runLastHour) {
      const xMax = dayjs(runLastHour).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
      boxes.push(buildBox(runStart, xMax, runCondition));
    }
    runStart = null;
    runCondition = null;
    runLastHour = null;
  };

  hours.forEach((h) => {
    if (!isSignificant(h)) {
      flush();
      return;
    }
    const contiguous =
      runLastHour !== null &&
      dayjs(h.timestamp).diff(dayjs(runLastHour), 'hour') === 1 &&
      h.condition === runCondition;
    if (!contiguous) {
      flush();
      runStart = h.timestamp;
      runCondition = h.condition;
    }
    runLastHour = h.timestamp;
  });
  flush();
  return boxes;
};

const coalesceDaily = (
  hours: WeatherHourly[]
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  const worstByDay = new Map<string, SignificantCondition>();
  hours.forEach((h) => {
    if (!isSignificant(h)) return;
    const day = h.timestamp.slice(0, 10);
    const current = worstByDay.get(day);
    if (!current || SEVERITY[h.condition] > SEVERITY[current]) {
      worstByDay.set(day, h.condition);
    }
  });

  return Array.from(worstByDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, condition]) =>
      buildBox(day, dayjs(day).add(1, 'day').format('YYYY-MM-DD'), condition)
    );
};

export const getWeatherAnnotations = (
  hours: WeatherHourly[],
  options?: WeatherAnnotationOptions
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  const granularity = options?.granularity ?? 'hourly';
  if (!hours.length) return [];
  return granularity === 'daily' ? coalesceDaily(hours) : coalesceHourly(hours);
};

export const countSignificantHours = (hours: WeatherHourly[]): number =>
  hours.filter(isSignificant).length;
