import { describe, expect, it } from 'vitest';
import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';
import { getBusRouteGroup } from '../../common/utils/stations';
import { LEADERBOARD_METRICS } from './constants';
import type { BusSpeedSegmentLeaderboardEntry } from './types';
import {
  groupLeaderboardByBusRoute,
  isPooledSegment,
  rankLeaderboard,
  segmentDistanceAndTime,
  sharedRouteKeys,
} from './utils';

const entry = (
  overrides: Partial<BusSpeedSegmentLeaderboardEntry> = {}
): BusSpeedSegmentLeaderboardEntry => ({
  route_id: '28',
  direction_id: 1,
  from_stop_name: 'A',
  to_stop_name: 'B',
  p50_speed_mph: 4.0,
  n_traversals: 40,
  n_interpolated: 0,
  ...overrides,
});

describe('segmentDistanceAndTime', () => {
  it('formats miles and minutes', () => {
    expect(
      segmentDistanceAndTime(entry({ segment_length_m: 402, p50_total_time_seconds: 112 }))
    ).toBe('0.25 mi · 1m 52s');
  });

  it('keeps short times in seconds', () => {
    expect(
      segmentDistanceAndTime(entry({ segment_length_m: 161, p50_total_time_seconds: 45 }))
    ).toBe('0.10 mi · 45s');
  });

  it('is undefined for files published without the fields', () => {
    expect(segmentDistanceAndTime(entry())).toBeUndefined();
    expect(segmentDistanceAndTime(entry({ segment_length_m: 402 }))).toBeUndefined();
    expect(segmentDistanceAndTime(entry({ p50_total_time_seconds: 112 }))).toBeUndefined();
  });
});

describe('sharedRouteKeys', () => {
  it('is empty for a single route', () => {
    expect(sharedRouteKeys(['751'])).toEqual([]);
  });

  it('joins a pair the way the pipeline does', () => {
    expect(sharedRouteKeys(['751', '749'])).toEqual(['749,751']);
  });

  it('lists every combination of two or more', () => {
    expect(sharedRouteKeys(['741', '742', '743', '746']).sort()).toEqual(
      [
        '741,742',
        '741,743',
        '741,746',
        '742,743',
        '742,746',
        '743,746',
        '741,742,743',
        '741,742,746',
        '741,743,746',
        '742,743,746',
        '741,742,743,746',
      ].sort()
    );
  });

  it('sorts ids as strings, not numbers', () => {
    expect(sharedRouteKeys(['8', '19'])).toEqual(['19,8']);
  });
});

describe('isPooledSegment', () => {
  it('is the feature whose route_id is its shared_routes', () => {
    expect(isPooledSegment({ route_id: '749,751', shared_routes: '749,751' })).toBe(true);
    expect(isPooledSegment({ route_id: '749', shared_routes: '749,751' })).toBe(false);
    expect(isPooledSegment({ route_id: '749' })).toBe(false);
  });
});

const DATE = '2026-10-31';
const [SPEED, BATTERY] = LEADERBOARD_METRICS;

const route = (
  id: string,
  mph: number,
  fleet: Pick<BusSpeedLeaderboardEntry, 'fleet_trips' | 'pct_battery_trips'> = {}
): BusSpeedLeaderboardEntry => ({
  route: id,
  miles_covered: mph,
  total_time: 3600,
  count: 10,
  n_traversals: 10,
  ...fleet,
});

describe('groupLeaderboardByBusRoute', () => {
  it('pools SL4 and SL5 into one row, weighting battery share by fleet trips', () => {
    const [row] = groupLeaderboardByBusRoute(
      [
        route('751', 10, { fleet_trips: 300, pct_battery_trips: 40 }),
        route('749', 20, { fleet_trips: 100, pct_battery_trips: 0 }),
      ],
      DATE
    );
    expect(row.route).toBe(getBusRouteGroup('751', DATE));
    expect(row.route).toBe(getBusRouteGroup('749', DATE));
    expect(row.miles_covered).toBe(30);
    expect(row.total_time).toBe(7200);
    expect(row.fleet_trips).toBe(400);
    expect(row.pct_battery_trips).toBe(30);
  });

  it('leaves out routes without fleet data when pooling', () => {
    const [row] = groupLeaderboardByBusRoute(
      [route('751', 10, { fleet_trips: 200, pct_battery_trips: 25 }), route('749', 20)],
      DATE
    );
    expect(row.fleet_trips).toBe(200);
    expect(row.pct_battery_trips).toBe(25);
  });

  it('has no fleet fields when no route has fleet data', () => {
    const [row] = groupLeaderboardByBusRoute([route('71', 10)], DATE);
    expect(row).not.toHaveProperty('fleet_trips');
    expect(row).not.toHaveProperty('pct_battery_trips');
  });
});

describe('rankLeaderboard', () => {
  const grouped = groupLeaderboardByBusRoute(
    [
      route('1', 12, { fleet_trips: 100, pct_battery_trips: 0 }),
      route('71', 9, { fleet_trips: 100, pct_battery_trips: 43.1 }),
      route('73', 8, { fleet_trips: 100, pct_battery_trips: 39.5 }),
      route('66', 7),
    ],
    DATE
  );

  it('ranks by speed, slowest first', () => {
    expect(rankLeaderboard(grouped, SPEED).map((row) => row.route)).toEqual([
      '66',
      '73',
      '71',
      '1',
    ]);
  });

  it('ranks by battery share, highest first, listing only routes with battery trips', () => {
    const ranked = rankLeaderboard(grouped, BATTERY);
    expect(ranked.map((row) => row.route)).toEqual(['71', '73']);
    expect(BATTERY.format(ranked[0].value)).toBe('43.1%');
  });
});
