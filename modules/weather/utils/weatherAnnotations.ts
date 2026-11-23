import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCloudBolt, faCloudRain, faSmog, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import type { WeatherCondition, WeatherHourly } from '../../../common/types/weather';
import { colorVisionPalette } from '../../../common/utils/colorVision';
import { hexWithAlpha } from '../../../common/utils/general';
import type {
  HoverCardRow,
  ResolvedHoverCardContent,
} from '../../../common/components/charts/hoverCard/types';
import { ONE_HOUR } from '../../../common/constants/time';
import { describeWeather, weatherRows } from './weatherDetails';

type ConditionReading = Pick<WeatherHourly, 'timestamp' | 'condition'>;

export type WeatherGranularity = 'hourly' | 'daily';

export type SignificantCondition = Exclude<WeatherCondition, 'clear' | 'cloudy' | 'unknown'>;

/** A stretch of one significant condition: consecutive hours, or consecutive days of it as their worst. */
export interface WeatherRun {
  start: string;
  end: string;
  condition: SignificantCondition;
}

export const WEATHER_BASE_COLORS: Record<SignificantCondition, string> = colorVisionPalette(
  {
    rain: '#60a5fa',
    snow: '#94a3b8',
    fog: '#9ca3af',
    storm: '#7c3aed',
  },
  // Snow goes icy blue so it parts from fog's gray, and storm goes magenta so it parts from rain
  { rain: '#3b7fd9', snow: '#8ad8f2', fog: '#a8a29e', storm: '#c0489a' }
);

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
const WEATHER_SHADING_ALPHA: Record<SignificantCondition, number> = {
  rain: 0.35,
  snow: 0.45,
  fog: 0.3,
  storm: 0.4,
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
  h: ConditionReading
): h is WeatherHourly & { condition: SignificantCondition } =>
  h.condition !== null && h.condition in SEVERITY;

const hourlyRuns = (hours: ConditionReading[]): WeatherRun[] => {
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

const dailyRuns = (hours: ConditionReading[]): WeatherRun[] => {
  const worstByDay = new Map<string, SignificantCondition>();
  hours.forEach((h) => {
    if (!isSignificant(h)) return;
    const day = h.timestamp.slice(0, 10);
    const current = worstByDay.get(day);
    if (!current || SEVERITY[h.condition] > SEVERITY[current]) {
      worstByDay.set(day, h.condition);
    }
  });

  // Back-to-back days with the same worst condition share one run
  const runs: WeatherRun[] = [];
  Array.from(worstByDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .forEach(([day, condition]) => {
      const end = dayjs(day).add(1, 'day').format('YYYY-MM-DD');
      const last = runs[runs.length - 1];
      if (last && last.end === day && last.condition === condition) {
        last.end = end;
      } else {
        runs.push({ start: day, end, condition });
      }
    });
  return runs;
};

export const getWeatherRuns = (
  hours: ConditionReading[],
  granularity: WeatherGranularity
): WeatherRun[] => (granularity === 'daily' ? dailyRuns(hours) : hourlyRuns(hours));

export const weatherRunKey = (run: WeatherRun) => `weather|${run.start}|${run.condition}`;

// Daily charts plot each day's point at midnight, so a day's run sits half a day earlier
const DAILY_OFFSET = 12 * ONE_HOUR;

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
  const offset = granularity === 'daily' ? DAILY_OFFSET : 0;
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

/**
 * The weather at `time` as a row for a chart's popover: the hour's own reading on hourly charts,
 * or the day's summary on daily ones. Undefined when no run covers it.
 */
export const weatherRowAt = (
  runs: PlacedWeatherRun[],
  time: number,
  granularity: WeatherGranularity
): HoverCardRow | undefined => {
  const placed = runs.find(({ start, end }) => time >= start && time < end);
  if (!placed) return undefined;
  const { run, hours } = placed;
  // A daily run can span several days, so read only the hovered one
  const own =
    granularity === 'hourly'
      ? hours.filter((h) => {
          const start = dayjs(h.timestamp).valueOf();
          return time >= start && time < start + ONE_HOUR;
        })
      : hours.filter(
          (h) => h.timestamp.slice(0, 10) === dayjs(time + DAILY_OFFSET).format('YYYY-MM-DD')
        );
  return {
    label: 'Weather',
    value: describeWeather(own.length ? own : hours, run.condition),
    color: WEATHER_BASE_COLORS[run.condition],
  };
};

// No hover card on the shading: it would stack on the chart's own popover, and the track already
// shows the same card
export const getWeatherAnnotations = (runs: PlacedWeatherRun[]): AnnotationOptions[] =>
  runs.map(({ run, start, end }) => ({
    type: 'box',
    xMin: start,
    xMax: end,
    backgroundColor: hexWithAlpha(
      WEATHER_BASE_COLORS[run.condition],
      WEATHER_SHADING_ALPHA[run.condition]
    ),
    borderColor: 'transparent',
    borderWidth: 0,
  }));
