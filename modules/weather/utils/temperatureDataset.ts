import dayjs from 'dayjs';
import type { WeatherHourly } from '../../../common/types/weather';
import { TWO_HOURS } from '../../../common/constants/time';

export type DailyTempPoint = { x: string; y: number };

export type DailyTemperatureSeries = {
  min: DailyTempPoint[];
  max: DailyTempPoint[];
  mean: DailyTempPoint[];
};

export const TEMPERATURE_BAND_COLOR = 'rgba(234, 88, 12, 0.18)';
export const TEMPERATURE_LINE_COLOR = 'rgb(234, 88, 12)';

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
