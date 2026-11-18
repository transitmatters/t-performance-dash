import { describe, expect, it } from 'vitest';

import { GAP, buildDay, clockText, durationText, judge } from './day';
import { END, START } from './day';
import { frameAt, PLAY_MS, HOLD_MS, FADE_MS } from './draw';

describe('buildDay', () => {
  const day = buildDay();

  it('is the same day every time', () => {
    expect(buildDay()).toEqual(day);
  });

  it('stops service for the 24 minutes after the disabled train', () => {
    expect(day.trips.some((t) => t.minute > GAP[0] && t.minute < GAP[1])).toBe(false);
    expect(GAP[1] - GAP[0]).toBe(24);
  });

  it('peaks at about 28 minutes, during the bad stretch', () => {
    expect(day.worst.seconds).toBeGreaterThan(26 * 60);
    expect(day.worst.seconds).toBeLessThan(30 * 60);
    expect(day.worst.status).toBe('100');
  });

  it('reports six cars on every trip, all inside the day', () => {
    for (const trip of day.trips) {
      expect(trip.cars).toHaveLength(6);
      expect(trip.minute).toBeGreaterThanOrEqual(START);
      expect(trip.minute).toBeLessThan(END);
    }
  });
});

describe('judge', () => {
  it('uses the trip charts’ bands against the benchmark', () => {
    expect([1, 1.3, 1.6, 2.1].map(judge)).toEqual(['ok', '25', '50', '100']);
  });
});

describe('frameAt', () => {
  it('plays the day, holds it, fades out, then loops', () => {
    expect(frameAt(0).minute).toBe(START);
    expect(frameAt(PLAY_MS + 1)).toMatchObject({ minute: END, fade: 1, done: false });
    expect(frameAt(PLAY_MS + HOLD_MS + FADE_MS / 2).fade).toBeCloseTo(0.5);
    expect(frameAt(PLAY_MS + HOLD_MS + FADE_MS).done).toBe(true);
  });
});

describe('text', () => {
  it('formats clock times and durations', () => {
    expect(clockText(500)).toBe('8:20 AM');
    expect(clockText(1500)).toBe('1:00 AM');
    expect(durationText(1668)).toBe('27m 48s');
  });
});
