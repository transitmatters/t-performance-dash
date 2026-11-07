import { describe, expect, it } from 'vitest';

import type { WeatherHourly } from '../../../types/weather';
import {
  getWeatherRuns,
  placeWeatherRuns,
} from '../../../../modules/weather/utils/weatherAnnotations';
import {
  alertSegments,
  clipAlert,
  formatTimeRange,
  packLanes,
  singleDayAxisBounds,
  toFraction,
} from './segments';

const hour = (timestamp: string, condition: WeatherHourly['condition']): WeatherHourly => ({
  timestamp,
  condition,
  temperature_f: 50,
  weather_code: null,
  precipitation_in: null,
  humidity_pct: null,
  wind_mph: null,
});

describe('toFraction', () => {
  const domain = { min: 100, max: 200 };

  it('maps a time across the domain', () => {
    expect(toFraction(150, domain)).toBe(0.5);
  });

  it('clamps times outside the domain', () => {
    expect(toFraction(50, domain)).toBe(0);
    expect(toFraction(250, domain)).toBe(1);
  });

  it('returns 0 for an empty domain', () => {
    expect(toFraction(100, { min: 100, max: 100 })).toBe(0);
  });
});

describe('packLanes', () => {
  it('stacks overlapping spans and reuses freed lanes', () => {
    const lanes = packLanes([
      { start: 0, end: 10 },
      { start: 5, end: 15 },
      { start: 10, end: 20 },
      { start: 16, end: 18 },
    ]).map(({ start, lane }) => [start, lane]);
    expect(lanes).toEqual([
      [0, 0],
      [5, 1],
      [10, 0],
      [16, 1],
    ]);
  });
});

describe('clipAlert', () => {
  it('clips an alert to the 5:30 AM – 1:15 AM service day', () => {
    const alert = {
      text: 'Delays',
      valid_from: '2026-11-04T22:00:00',
      valid_to: '2026-11-07T09:00:00',
    };
    expect(clipAlert(alert, '2026-11-05')).toEqual({
      from: '2026-11-05T05:30:00',
      to: '2026-11-06T01:15:00',
    });
  });

  it('keeps an alert inside the service day as it is', () => {
    const alert = {
      text: 'Delays',
      valid_from: '2026-11-05T08:05:00',
      valid_to: '2026-11-05T10:40:00',
    };
    expect(clipAlert(alert, '2026-11-05')).toEqual({
      from: '2026-11-05T08:05:00',
      to: '2026-11-05T10:40:00',
    });
  });

  it('drops an alert that falls outside the service day', () => {
    const alert = {
      text: 'Delays',
      valid_from: '2026-11-06T01:30:00',
      valid_to: '2026-11-06T03:00:00',
    };
    expect(clipAlert(alert, '2026-11-05')).toBeNull();
  });
});

describe('alertSegments', () => {
  it('gives overlapping alerts separate lanes', () => {
    const segments = alertSegments(
      [
        { text: 'A', valid_from: '2026-11-05T08:00:00', valid_to: '2026-11-05T10:00:00' },
        { text: 'B', valid_from: '2026-11-05T09:00:00', valid_to: '2026-11-05T11:00:00' },
      ],
      '2026-11-05'
    );
    expect(segments.map(({ alert, lane }) => [alert.text, lane])).toEqual([
      ['A', 0],
      ['B', 1],
    ]);
  });
});

describe('singleDayAxisBounds', () => {
  it('keeps at least 6 AM to 1:15 AM', () => {
    expect(singleDayAxisBounds('2026-11-05', ['2026-11-05 08:00:00'])).toEqual({
      min: new Date('2026-11-05T06:00:00').valueOf(),
      max: new Date('2026-11-06T01:15:00').valueOf(),
    });
  });

  it('widens to the trips, with five minutes before the first', () => {
    expect(
      singleDayAxisBounds('2026-11-05', ['2026-11-05 05:20:00', '2026-11-06 01:40:00'])
    ).toEqual({
      min: new Date('2026-11-05T05:15:00').valueOf(),
      max: new Date('2026-11-06T01:40:00').valueOf(),
    });
  });
});

describe('formatTimeRange', () => {
  it('formats a span of hours', () => {
    expect(formatTimeRange('2026-11-05T08:05:00', '2026-11-05T10:40:00')).toBe(
      '8:05 AM – 10:40 AM'
    );
  });

  it('calls a span of a day or more all day', () => {
    expect(formatTimeRange('2026-11-04T00:00:00', '2026-11-06T00:00:00')).toBe('All day');
  });

  it('names a single day for daily ranges', () => {
    expect(formatTimeRange('2026-11-05', '2026-11-06', true)).toBe('Thu, Nov 5');
  });
});

describe('getWeatherRuns', () => {
  const hours = [
    hour('2026-11-05T07:00:00', 'rain'),
    hour('2026-11-05T08:00:00', 'rain'),
    hour('2026-11-05T09:00:00', 'snow'),
    hour('2026-11-05T10:00:00', 'cloudy'),
    hour('2026-11-05T11:00:00', 'rain'),
    hour('2026-11-06T03:00:00', 'fog'),
  ];

  it('joins consecutive hours of one condition', () => {
    expect(getWeatherRuns(hours, 'hourly')).toEqual([
      { start: '2026-11-05T07:00:00', end: '2026-11-05T09:00:00', condition: 'rain' },
      { start: '2026-11-05T09:00:00', end: '2026-11-05T10:00:00', condition: 'snow' },
      { start: '2026-11-05T11:00:00', end: '2026-11-05T12:00:00', condition: 'rain' },
      { start: '2026-11-06T03:00:00', end: '2026-11-06T04:00:00', condition: 'fog' },
    ]);
  });

  it('keeps the most severe condition of each day', () => {
    expect(getWeatherRuns(hours, 'daily')).toEqual([
      { start: '2026-11-05', end: '2026-11-06', condition: 'snow' },
      { start: '2026-11-06', end: '2026-11-07', condition: 'fog' },
    ]);
  });

  it('clips runs to the window and drops those outside it', () => {
    const window = {
      start: new Date('2026-11-05T07:30:00').valueOf(),
      end: new Date('2026-11-05T11:30:00').valueOf(),
    };
    const placed = placeWeatherRuns(hours, 'hourly', window);
    expect(placed.map(({ run }) => run.condition)).toEqual(['rain', 'snow', 'rain']);
    expect(placed[0].start).toBe(window.start);
    expect(placed[2].end).toBe(window.end);
  });

  it('centers daily runs on their day', () => {
    const [first] = placeWeatherRuns(hours, 'daily');
    expect(first.start).toBe(new Date('2026-11-04T12:00:00').valueOf());
    expect(first.end).toBe(new Date('2026-11-05T12:00:00').valueOf());
  });
});
