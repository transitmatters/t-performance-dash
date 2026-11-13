import dayjs from 'dayjs';
import type { ScriptableContext } from 'chart.js';
import type { WeatherHourly } from '../../../common/types/weather';
import { TWO_HOURS } from '../../../common/constants/time';

export type DailyTempPoint = { x: string; y: number };

export type DailyTemperatureSeries = {
  min: DailyTempPoint[];
  max: DailyTempPoint[];
  mean: DailyTempPoint[];
};

/**
 * Cold to hot in °F. Fixed, so a temperature reads as the same color in every date range, and
 * each color holds 3:1 against both the light and the dark card, so it doesn't vary with theme.
 */
export const TEMPERATURE_COLOR_STOPS: [number, string][] = [
  [20, '#3b82f6'],
  [50, '#16a34a'],
  [75, '#ea580c'],
  [95, '#dc2626'],
];

// The opacity of the daily low–high band under the mean line
export const TEMPERATURE_BAND_OPACITY = 0.18;

const COLDEST = TEMPERATURE_COLOR_STOPS[0][0];
const HOTTEST = TEMPERATURE_COLOR_STOPS[TEMPERATURE_COLOR_STOPS.length - 1][0];

/** Where a stop sits along a gradient running from the coldest stop to the hottest. */
export const temperatureStopOffset = (temperature: number) =>
  (temperature - COLDEST) / (HOTTEST - COLDEST);

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * The ramp's color at a temperature, blended in sRGB the way SVG and canvas gradients blend, so a
 * hover dot matches the line under it. Past either end it keeps the end color.
 */
export const temperatureColor = (temperature: number): string => {
  const clamped = Math.min(Math.max(temperature, COLDEST), HOTTEST);
  const upper = Math.max(
    1,
    TEMPERATURE_COLOR_STOPS.findIndex(([stop]) => clamped <= stop)
  );
  const [fromStop, fromColor] = TEMPERATURE_COLOR_STOPS[upper - 1];
  const [toStop, toColor] = TEMPERATURE_COLOR_STOPS[upper];
  const share = (clamped - fromStop) / (toStop - fromStop);
  const from = toRgb(fromColor);
  const to = toRgb(toColor);
  const [r, g, b] = from.map((channel, i) => Math.round(channel + share * (to[i] - channel)));
  return `rgb(${r}, ${g}, ${b})`;
};

/** A Chart.js color option painting the ramp along the chart's `yTemp` axis. */
export const temperatureGradient =
  (opacity = 1) =>
  ({ chart }: ScriptableContext<'line'>): CanvasGradient | string => {
    const scale = chart.scales.yTemp;
    if (!chart.chartArea || !scale) return temperatureColor((COLDEST + HOTTEST) / 2);
    const gradient = chart.ctx.createLinearGradient(
      0,
      scale.getPixelForValue(COLDEST),
      0,
      scale.getPixelForValue(HOTTEST)
    );
    TEMPERATURE_COLOR_STOPS.forEach(([stop, color]) => {
      const [r, g, b] = toRgb(color);
      gradient.addColorStop(temperatureStopOffset(stop), `rgba(${r}, ${g}, ${b}, ${opacity})`);
    });
    return gradient;
  };

/** A Chart.js color option coloring a hovered point by its own temperature. */
export const temperaturePointColor = ({ parsed }: ScriptableContext<'line'>) =>
  typeof parsed?.y === 'number' ? temperatureColor(parsed.y) : undefined;

// A fixed scale so a mild day looks mild; colder or hotter readings stretch it
export const TEMPERATURE_SCALE = { min: 0, max: 100 };

export const getHourlyTemperatureSeries = (hours: WeatherHourly[]): DailyTempPoint[] =>
  hours
    .filter((h) => h.temperature_f !== null && h.temperature_f !== undefined)
    .map((h) => ({ x: h.timestamp, y: h.temperature_f as number }));

export const getDailyTemperatureSeries = (hours: WeatherHourly[]): DailyTemperatureSeries => {
  const byDay = new Map<string, number[]>();
  hours.forEach((h) => {
    if (h.temperature_f === null || h.temperature_f === undefined) return;
    const day = h.timestamp.slice(0, 10);
    const bucket = byDay.get(day);
    if (bucket) {
      bucket.push(h.temperature_f);
    } else {
      byDay.set(day, [h.temperature_f]);
    }
  });

  const days = Array.from(byDay.keys()).sort();
  const min: DailyTempPoint[] = [];
  const max: DailyTempPoint[] = [];
  const mean: DailyTempPoint[] = [];

  days.forEach((day) => {
    const temps = byDay.get(day)!;
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    min.push({ x: day, y: Math.min(...temps) });
    max.push({ x: day, y: Math.max(...temps) });
    mean.push({ x: day, y: Number(avg.toFixed(1)) });
  });

  return { min, max, mean };
};

/**
 * The daily series laid on the chart's own dates, null where there's no reading. Charts whose data
 * skips days (e.g. weekdays only) would otherwise pair point N of the data with a different day's
 * temperature when hovered.
 */
export const alignDailyTemperatureSeries = (
  series: DailyTemperatureSeries,
  labels: string[]
): Record<keyof DailyTemperatureSeries, { x: string; y: number | null }[]> => {
  const onLabels = (points: DailyTempPoint[]) => {
    const byDay = new Map(points.map(({ x, y }) => [x.slice(0, 10), y]));
    return labels.map((label) => ({ x: label, y: byDay.get(String(label).slice(0, 10)) ?? null }));
  };
  return { min: onLabels(series.min), max: onLabels(series.max), mean: onLabels(series.mean) };
};

/**
 * The temperature at `time` (epoch ms), read off the hourly series between the readings either
 * side of it. Undefined outside the series or across a gap in the readings.
 */
export const temperatureAt = (series: DailyTempPoint[], time: number): number | undefined => {
  for (let i = 1; i < series.length; i++) {
    const start = dayjs(series[i - 1].x).valueOf();
    const end = dayjs(series[i].x).valueOf();
    if (time < start || time > end) continue;
    if (end - start > TWO_HOURS) return undefined;
    const share = end > start ? (time - start) / (end - start) : 0;
    return series[i - 1].y + share * (series[i].y - series[i - 1].y);
  }
  return undefined;
};

/** A day's mean, low and high, by its YYYY-MM-DD date. */
export const dailyTemperatureOn = (series: DailyTemperatureSeries, day: string) => {
  const index = series.mean.findIndex((point) => point.x === day);
  if (index === -1) return undefined;
  return { mean: series.mean[index].y, low: series.min[index].y, high: series.max[index].y };
};
