import { describe, expect, it } from 'vitest';
import type { CrScorecardEntry, ScorecardDirection } from '../../../common/types/dataPoints';
import {
  SPAN_HOURS,
  SPAN_HOUR_INDEXES,
  formatHour,
  hourLevel,
  serviceSpan,
  weakerByHour,
} from './utils';

const direction = (overrides: Partial<ScorecardDirection> = {}): ScorecardDirection => ({
  trips: 20,
  firstTrip: 6 * 3600,
  lastTrip: 22 * 3600,
  maxGapMidday: 60,
  maxGapEvening: 90,
  hoursAtTarget: 5,
  clockFaceShare: 0.5,
  byHour: Array(24).fill(1),
  ...overrides,
});

const entry = (
  outbound: Partial<ScorecardDirection>,
  inbound: Partial<ScorecardDirection>,
  days = 1
): CrScorecardEntry => ({
  date: '2026-01-05',
  days,
  outbound: direction(outbound),
  inbound: direction(inbound),
  peakTrips: 10,
  reversePeakTrips: 4,
});

describe('the Regional Rail span', () => {
  it('runs 5am through the midnight hour', () => {
    expect(SPAN_HOUR_INDEXES).toHaveLength(SPAN_HOURS);
    expect(SPAN_HOUR_INDEXES[0]).toBe(5);
    expect(SPAN_HOUR_INDEXES.at(-2)).toBe(23);
    expect(SPAN_HOUR_INDEXES.at(-1)).toBe(0);
  });

  it('labels hours on a 12-hour clock', () => {
    expect(formatHour(5)).toBe('5 AM');
    expect(formatHour(12)).toBe('12 PM');
    expect(formatHour(23)).toBe('11 PM');
    expect(formatHour(0)).toBe('12 AM');
  });
});

describe('weakerByHour', () => {
  it('takes the direction with fewer trains each hour, and leaves gaps as gaps', () => {
    const outbound = Array(24).fill(2);
    const inbound = Array(24).fill(1);
    outbound[8] = 0;
    inbound[9] = null;
    const hours = weakerByHour(entry({ byHour: outbound }, { byHour: inbound }));
    expect(hours[7]).toBe(1);
    expect(hours[8]).toBe(0);
    expect(hours[9]).toBeNull();
  });
});

describe('hourLevel', () => {
  it('shades by the rounded average, capped at three or more', () => {
    expect(hourLevel(null)).toBe(0);
    expect(hourLevel(0.4)).toBe(0);
    expect(hourLevel(0.6)).toBe(1);
    expect(hourLevel(1.8)).toBe(2);
    expect(hourLevel(2.5)).toBe(3);
    expect(hourLevel(6)).toBe(3);
  });
});

describe('serviceSpan', () => {
  it('runs from the earliest first train to the latest last train, either direction', () => {
    const span = serviceSpan([
      entry(
        { firstTrip: 5.5 * 3600, lastTrip: 23 * 3600 },
        { firstTrip: 6 * 3600, lastTrip: 24.5 * 3600 }
      ),
    ]);
    expect(span.first).toBe(5.5 * 3600);
    expect(span.last).toBe(24.5 * 3600);
  });

  it('averages each over the range, weighted by days', () => {
    const span = serviceSpan([
      entry({ firstTrip: 6 * 3600 }, { firstTrip: 6 * 3600 }, 3),
      entry({ firstTrip: 10 * 3600 }, { firstTrip: 10 * 3600 }, 1),
    ]);
    expect(span.first).toBe(7 * 3600);
  });

  it('is empty without trains', () => {
    expect(
      serviceSpan([entry({ firstTrip: null, lastTrip: null }, { firstTrip: null, lastTrip: null })])
    ).toEqual({
      first: undefined,
      last: undefined,
    });
  });
});
