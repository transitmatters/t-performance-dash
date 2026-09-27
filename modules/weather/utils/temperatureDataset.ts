import type { WeatherHourly } from '../../../common/types/weather';

export type DailyTempPoint = { x: string; y: number };

export type DailyTemperatureSeries = {
  min: DailyTempPoint[];
  max: DailyTempPoint[];
  mean: DailyTempPoint[];
};

export const TEMPERATURE_BAND_COLOR = 'rgba(234, 88, 12, 0.18)';
export const TEMPERATURE_LINE_COLOR = 'rgb(234, 88, 12)';

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
