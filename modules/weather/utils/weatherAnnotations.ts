import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCloudBolt, faCloudRain, faSmog, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import type { WeatherCondition, WeatherHourly } from '../../../common/types/weather';
import { hexWithAlpha } from '../../../common/utils/general';
import { annotationTooltip } from '../../../common/components/charts/annotationTooltip';
import type { ResolvedHoverCardContent } from '../../../common/components/charts/hoverCard/types';
import { ONE_HOUR } from '../../../common/constants/time';
import { describeWeather, weatherRows } from './weatherDetails';

export type WeatherGranularity = 'hourly' | 'daily';

export type SignificantCondition = Exclude<WeatherCondition, 'clear' | 'cloudy' | 'unknown'>;

/** A stretch of one significant condition: consecutive hours, or a single day's worst. */
export interface WeatherRun {
  start: string;
  end: string;
  condition: SignificantCondition;
}

export const WEATHER_BASE_COLORS: Record<SignificantCondition, string> = {
  rain: '#60a5fa',
  snow: '#94a3b8',
  fog: '#9ca3af',
  storm: '#7c3aed',
};

export const WEATHER_ICONS: Record<SignificantCondition, IconDefinition> = {
  rain: faCloudRain,
  snow: faSnowflake,
  fog: faSmog,
  storm: faCloudBolt,
};

/** The icon at the head of a condition's hover card. */
export const weatherTitleIcon = (condition: SignificantCondition) => ({
  icon: WEATHER_ICONS[condition],
  color: WEATHER_BASE_COLORS[condition],
});

// Shading on the plot stays faint so the data reads through it
const WEATHER_SHADING: Record<SignificantCondition, string> = {
  rain: hexWithAlpha(WEATHER_BASE_COLORS.rain, 0.35),
  snow: hexWithAlpha(WEATHER_BASE_COLORS.snow, 0.45),
  fog: hexWithAlpha(WEATHER_BASE_COLORS.fog, 0.3),
  storm: hexWithAlpha(WEATHER_BASE_COLORS.storm, 0.4),
};

export const WEATHER_LABELS: Record<SignificantCondition, string> = {
  rain: 'Rain',
  snow: 'Snow',
  fog: 'Fog',
  storm: 'Storm',
};

// Higher-severity conditions win when coalescing a day's worth of hours down
// to a single category.
const SEVERITY: Record<SignificantCondition, number> = {
  storm: 4,
  snow: 3,
  fog: 2,
  rain: 1,
};

const isSignificant = (
  h: WeatherHourly
): h is WeatherHourly & { condition: SignificantCondition } =>
  h.condition !== null && h.condition in SEVERITY;

const hourlyRuns = (hours: WeatherHourly[]): WeatherRun[] => {
  const runs: WeatherRun[] = [];
  let current: { start: string; last: string; condition: SignificantCondition } | null = null;

  const flush = () => {
    if (current) {
      const end = dayjs(current.last).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
      runs.push({ start: current.start, end, condition: current.condition });
    }
    current = null;
  };

  hours.forEach((h) => {
    if (!isSignificant(h)) {
      flush();
      return;
    }
    const contiguous =
      current !== null &&
      dayjs(h.timestamp).diff(dayjs(current.last), 'hour') === 1 &&
      h.condition === current.condition;
    if (contiguous && current) {
      current.last = h.timestamp;
    } else {
      flush();
      current = { start: h.timestamp, last: h.timestamp, condition: h.condition };
    }
  });
  flush();
  return runs;
};

const dailyRuns = (hours: WeatherHourly[]): WeatherRun[] => {
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
    .map(([day, condition]) => ({
      start: day,
      end: dayjs(day).add(1, 'day').format('YYYY-MM-DD'),
      condition,
    }));
};

export const getWeatherRuns = (
  hours: WeatherHourly[],
  granularity: WeatherGranularity
): WeatherRun[] => (granularity === 'daily' ? dailyRuns(hours) : hourlyRuns(hours));

export const weatherRunKey = (run: WeatherRun) => `weather|${run.start}|${run.condition}`;

/** A run placed on a chart's time axis, in epoch milliseconds. */
export interface PlacedWeatherRun {
  run: WeatherRun;
  key: string;
  start: number;
  end: number;
  // The hours it covers, after clipping
  hours: WeatherHourly[];
}

/**
 * Places each run on the time axis. Daily runs center on their day, as the charts plot each day's
 * point at midnight. Runs are clipped to `window`, and dropped when they fall outside it.
 */
export const placeWeatherRuns = (
  hours: WeatherHourly[],
  granularity: WeatherGranularity,
  window?: { start: number; end: number }
): PlacedWeatherRun[] => {
  const offset = granularity === 'daily' ? 12 * 60 * 60 * 1000 : 0;
  const times = hours.map((hour) => dayjs(hour.timestamp).valueOf());
  return getWeatherRuns(hours, granularity).flatMap((run) => {
    let start = dayjs(run.start).valueOf();
    let end = dayjs(run.end).valueOf();
    if (window) {
      start = Math.max(start, window.start);
      end = Math.min(end, window.end);
      if (start >= end) return [];
    }
    // Each reading covers the hour from its timestamp
    const covered = hours.filter((_, i) => times[i] + ONE_HOUR > start && times[i] < end);
    return [
      { run, key: weatherRunKey(run), start: start - offset, end: end - offset, hours: covered },
    ];
  });
};

/** A run's hover card: what fell and how hard, how much, the wind, and when. */
export const weatherCard = (
  { run, hours }: PlacedWeatherRun,
  range: string
): ResolvedHoverCardContent => ({
  title: describeWeather(hours, run.condition),
  titleIcon: weatherTitleIcon(run.condition),
  rows: weatherRows(hours, run.condition),
  notes: [range],
});

export const getWeatherAnnotations = (
  runs: PlacedWeatherRun[],
  describe: (run: WeatherRun) => string
): AnnotationOptions<keyof AnnotationTypeRegistry>[] =>
  runs.map((placed) => {
    const card = weatherCard(placed, describe(placed.run));
    return {
      type: 'box',
      xMin: placed.start,
      xMax: placed.end,
      backgroundColor: WEATHER_SHADING[placed.run.condition],
      borderColor: 'transparent',
      borderWidth: 0,
      ...annotationTooltip({
        title: card.title,
        titleIcon: card.titleIcon,
        rows: card.rows,
        lines: card.notes ?? [],
      }),
    };
  });
