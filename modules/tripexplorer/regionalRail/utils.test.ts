import { describe, expect, it } from 'vitest';

import { rreExploreUrl } from '../../../common/api/regionalRailExplorer';
import type {
  RreJourney,
  RreScenarioError,
  RreSegment,
} from '../../../common/types/regionalRailExplorer';
import { formatClock } from '../../service/regionalRail/utils';
import {
  compareTrips,
  dayKindForDate,
  describeDeparture,
  formatDuration,
  percentLess,
  summarizeTrip,
  trainsMultiple,
} from './utils';

const SHARON = { id: 'place-NEC-2108', name: 'Sharon' };
const SOUTH_STATION = { id: 'place-sstat', name: 'South Station' };

const wait = (startTime: number, endTime: number): RreSegment => ({
  kind: 'transfer',
  startTime,
  endTime,
  waitDuration: endTime - startTime,
  walkDuration: 0,
});

const ride = (startTime: number, endTime: number, routeId = 'CR-Providence'): RreSegment => ({
  kind: 'travel',
  startTime,
  endTime,
  startStation: SHARON,
  endStation: SOUTH_STATION,
  routeId,
});

const journey = (overrides: Partial<RreJourney>): RreJourney => ({
  scenario: { id: 'present', name: "Today's commuter rail" },
  segments: [],
  amenities: [],
  arrivals: {},
  navigationFailed: false,
  ...overrides,
});

// Leaving Sharon at noon (43200): today's train is at 12:42, Regional Rail's at 12:07
const today = journey({
  segments: [wait(43200, 45720), ride(45720, 48000)],
  amenities: ['levelBoarding'],
  arrivals: { [SHARON.id]: { station: SHARON, times: [36000, 45720, 52920] } },
});
const regionalRail = journey({
  scenario: { id: 'regional_rail', name: 'Electrified regional rail' },
  segments: [wait(43200, 43620), ride(43620, 45060)],
  amenities: ['electricTrains', 'levelBoarding', 'increasedTopSpeed'],
  arrivals: {
    [SHARON.id]: { station: SHARON, times: [41820, 43620, 45420, 47220, 49020, 50820] },
  },
});

describe('summarizeTrip', () => {
  it('measures the trip from leaving to arriving, and the wait for the train', () => {
    expect(summarizeTrip(today)).toEqual({
      start: 43200,
      end: 48000,
      wait: 2520,
      trains: [36000, 45720, 52920],
      caught: 45720,
    });
  });

  it('has no trip when the Explorer finds no route or the scenario errors', () => {
    expect(summarizeTrip(journey({ navigationFailed: true }))).toBeNull();
    const error: RreScenarioError = {
      error: true,
      payload: { scenario: { id: 'present', name: "Today's commuter rail" } },
    };
    expect(summarizeTrip(error)).toBeNull();
    expect(summarizeTrip(undefined)).toBeNull();
  });

  it('only counts waits for Commuter Rail trains, and drops trains for a trip that starts on the subway', () => {
    const viaRedLine = journey({
      segments: [
        wait(43200, 43500),
        ride(43500, 44400, 'Red'),
        wait(44400, 45000),
        ride(45000, 46000),
      ],
      arrivals: { [SHARON.id]: { station: SHARON, times: [43500, 43800] } },
    });
    expect(summarizeTrip(viaRedLine)).toMatchObject({
      wait: 600,
      trains: undefined,
      caught: undefined,
    });
  });
});

describe('compareTrips', () => {
  it("lists what Regional Rail adds that today's trains lack, in a fixed order", () => {
    expect(compareTrips([today, regionalRail]).amenities).toEqual([
      'electricTrains',
      'increasedTopSpeed',
    ]);
  });

  it('keeps the Regional Rail trip when today has none', () => {
    const comparison = compareTrips([journey({ navigationFailed: true }), regionalRail]);
    expect(comparison.today).toBeNull();
    expect(comparison.regionalRail?.end).toBe(45060);
    expect(comparison.amenities).toEqual(['electricTrains', 'increasedTopSpeed', 'levelBoarding']);
  });
});

describe('percentLess', () => {
  it('rounds to a whole percent, and only when Regional Rail is less', () => {
    expect(percentLess(4800, 1860)).toBe(61);
    expect(percentLess(600, 600)).toBeUndefined();
    expect(percentLess(600, 900)).toBeUndefined();
    expect(percentLess(0, 0)).toBeUndefined();
  });
});

describe('trainsMultiple', () => {
  it('compares counts once Regional Rail runs half again as many', () => {
    expect(trainsMultiple(25, 81)).toBe('3.2×');
    expect(trainsMultiple(20, 40)).toBe('2×');
    expect(trainsMultiple(4, 80)).toBe('20×');
    expect(trainsMultiple(30, 40)).toBeUndefined();
    expect(trainsMultiple(0, 40)).toBeUndefined();
  });
});

describe('formatting', () => {
  it('floors durations and clock times to the minute, as the Explorer does', () => {
    expect(formatDuration(2959)).toBe('49 min');
    expect(formatDuration(4320)).toBe('1 hr 12 min');
    expect(formatDuration(7200)).toBe('2 hr');
    expect(formatClock(20203)).toBe('5:36 AM');
    expect(formatClock(43200)).toBe('12:00 PM');
    expect(formatClock(75600)).toBe('9:00 PM');
    // Trains after midnight run past 86400
    expect(formatClock(86760)).toBe('12:06 AM');
  });

  it('describes when the rider leaves', () => {
    expect(describeDeparture('weekday', 43200)).toBe('leaving at noon on a weekday');
    expect(describeDeparture('saturday', 75600)).toBe('leaving at 9 PM on a Saturday');
  });
});

describe('dayKindForDate', () => {
  it("plans the kind of day a date falls on, and a weekday when there's no date", () => {
    expect(dayKindForDate('2026-11-12')).toBe('weekday');
    expect(dayKindForDate('2026-11-14')).toBe('saturday');
    expect(dayKindForDate('2026-11-15')).toBe('sunday');
    expect(dayKindForDate(undefined)).toBe('weekday');
  });
});

describe('rreExploreUrl', () => {
  it('links to the same trip the preview fetched', () => {
    expect(
      rreExploreUrl({ from: SHARON.id, to: SOUTH_STATION.id, day: 'weekday', time: 43200 })
    ).toBe(
      'https://regionalrail.rocks/explore?from=place-NEC-2108&to=place-sstat&day=weekday&time=43200&navigationKind=depart-at'
    );
  });
});
