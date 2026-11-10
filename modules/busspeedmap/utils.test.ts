import { describe, expect, it } from 'vitest';
import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';
import type { BusSpeedSegmentLeaderboardEntry, BusSpeedSegmentProperties } from './types';
import {
  groupLeaderboardByBusRoute,
  isPooledSegment,
  leaderboardHeadwayShare,
  periodSuffix,
  rankLeaderboard,
  segmentDistanceAndTime,
  segmentDwell,
  segmentSpeedRange,
  sharedRouteKeys,
  stopDwellsByRoute,
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

describe('periodSuffix', () => {
  it('names the week or month, and nothing for a day', () => {
    expect(periodSuffix('daily')).toBe('');
    expect(periodSuffix('weekly')).toBe(' this week');
    expect(periodSuffix('monthly')).toBe(' this month');
  });
});

describe('segmentDwell', () => {
  it('formats seconds, and minutes for a long hold', () => {
    expect(segmentDwell({ median_dwell_seconds: 25 })).toBe('25s');
    expect(segmentDwell({ median_dwell_seconds: 1554 })).toBe('25m 54s');
  });

  it('is undefined for tiles published without it', () => {
    expect(segmentDwell({})).toBeUndefined();
  });

  it('is undefined for zero, which can just mean trips start there', () => {
    expect(segmentDwell({ median_dwell_seconds: 0 })).toBeUndefined();
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

describe('segmentSpeedRange', () => {
  it('runs slowest to fastest, to a tenth under 10 mph and whole above it', () => {
    expect(segmentSpeedRange({ p90_speed_mph: 2.1, p10_speed_mph: 9 })).toBe('2.1–9.0 mph');
    expect(segmentSpeedRange({ p90_speed_mph: 8.4, p10_speed_mph: 21 })).toBe('8.4–21 mph');
  });

  it('is undefined for tiles published without it', () => {
    expect(segmentSpeedRange({})).toBeUndefined();
  });

  it('is undefined for a segment with too few trips to say', () => {
    expect(segmentSpeedRange({ p90_speed_mph: 8.4 })).toBeUndefined();
  });
});

describe('stopDwellsByRoute', () => {
  const segment = (
    route_id: string,
    median_dwell_seconds: number | undefined,
    n_traversals = 40,
    shared_routes?: string
  ): BusSpeedSegmentProperties => ({
    route_id,
    direction_id: 1,
    from_stop_id: '12345',
    from_stop_name: 'A',
    to_stop_name: 'B',
    time_band: 'am_peak',
    p50_speed_mph: 4.0,
    n_traversals,
    n_interpolated: 0,
    median_dwell_seconds,
    shared_routes,
  });
  const routes = (segments: BusSpeedSegmentProperties[]) =>
    segments.map(({ route_id, median_dwell_seconds }) => [route_id, median_dwell_seconds]);

  it('lists routes in the order a rider would, by their names', () => {
    expect(
      routes(stopDwellsByRoute([segment('751', 12), segment('749', 14), segment('10', 8)]))
    ).toEqual([
      ['10', 8],
      ['751', 12],
      ['749', 14],
    ]);
  });

  it('takes the busiest branch of a route that splits at the stop', () => {
    expect(routes(stopDwellsByRoute([segment('1', 30, 5), segment('1', 12, 80)]))).toEqual([
      ['1', 12],
    ]);
  });

  it('lists a segment split across tiles once', () => {
    expect(routes(stopDwellsByRoute([segment('1', 12), segment('1', 12)]))).toEqual([['1', 12]]);
  });

  it('leaves out pooled features, whose routes are listed anyway', () => {
    expect(
      routes(
        stopDwellsByRoute([
          segment('749,751', 13, 80, '749,751'),
          segment('749', 14, 40, '749,751'),
          segment('751', 12, 40, '749,751'),
        ])
      )
    ).toEqual([
      ['751', 12],
      ['749', 14],
    ]);
  });

  it('leaves out routes with nothing to show', () => {
    expect(routes(stopDwellsByRoute([segment('1', 0), segment('47', undefined)]))).toEqual([]);
  });
});

describe('isPooledSegment', () => {
  it('is the feature whose route_id is its shared_routes', () => {
    expect(isPooledSegment({ route_id: '749,751', shared_routes: '749,751' })).toBe(true);
    expect(isPooledSegment({ route_id: '749', shared_routes: '749,751' })).toBe(false);
    expect(isPooledSegment({ route_id: '749' })).toBe(false);
  });
});

describe('route leaderboard ranking', () => {
  const route = (
    id: string,
    mph: number,
    headways?: [number, number, number, number, number]
  ): BusSpeedLeaderboardEntry => ({
    route: id,
    miles_covered: mph,
    total_time: 3600,
    count: 1,
    n_traversals: 1,
    ...(headways && {
      headways_under_50: headways[0],
      headways_50_75: headways[1],
      headways_75_125: headways[2],
      headways_125_150: headways[3],
      headways_over_150: headways[4],
    }),
  });

  const DATE = '2026-11-02';

  it('pools headway counts from only the frequent routes in a group', () => {
    // 116 is a Frequent Bus Route; 114 and 117 aren't. They shared a label until 2024-12-15.
    const [group] = groupLeaderboardByBusRoute(
      [route('114', 8, [50, 0, 0, 0, 50]), route('116', 9, [1, 1, 6, 1, 1]), route('117', 10)],
      '2024-12-01'
    );

    expect(group.route).toBe('114/116/117');
    expect(group.isFrequentRoute).toBe(true);
    expect(group.headways_under_50).toBe(1);
    expect(group.headways_75_125).toBe(6);
    expect(group.miles_covered).toBe(27);
  });

  it('adds up every frequent route in a group', () => {
    const [group] = groupLeaderboardByBusRoute(
      [route('749', 8, [2, 0, 4, 0, 4]), route('751', 9, [3, 0, 1, 0, 1])],
      DATE
    );

    expect(group.route).toBe('SL4/SL5');
    expect(group.headways_under_50).toBe(5);
    expect(group.headways_75_125).toBe(5);
  });

  const grouped = () =>
    groupLeaderboardByBusRoute(
      [
        route('1', 6, [1, 0, 8, 0, 1]), // 10% bunched, 80% within
        route('28', 7, [3, 0, 5, 0, 2]), // 30% bunched, 50% within
        route('39', 9, [2, 0, 2, 0, 6]), // 20% bunched, 20% within
        route('7', 5, [9, 0, 0, 0, 1]), // not frequent
        route('57', 8), // frequent, but no headways counted
      ],
      DATE
    );

  it('keeps every route slowest first for speed', () => {
    expect(rankLeaderboard(grouped(), 'speed').map((entry) => entry.route)).toEqual([
      '7',
      '1',
      '28',
      '57',
      '39',
    ]);
  });

  it('ranks frequent routes with headways, most bunched first', () => {
    const ranked = rankLeaderboard(grouped(), 'bunched');

    expect(ranked.map((entry) => entry.route)).toEqual(['28', '39', '1']);
    expect(leaderboardHeadwayShare(ranked[0], 'bunched')).toBe(30);
  });

  it('ranks frequent routes with headways, least reliable first', () => {
    const ranked = rankLeaderboard(grouped(), 'reliability');

    expect(ranked.map((entry) => entry.route)).toEqual(['39', '28', '1']);
    expect(leaderboardHeadwayShare(ranked[2], 'reliability')).toBe(80);
  });
});
