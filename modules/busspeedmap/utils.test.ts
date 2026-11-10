import { describe, expect, it } from 'vitest';
import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';
import { getBusRouteGroup } from '../../common/utils/stations';
import { LEADERBOARD_METRICS } from './constants';
import type { BusSpeedSegmentLeaderboardEntry, BusSpeedSegmentProperties } from './types';
import {
  averageDwell,
  dwellShare,
  groupLeaderboardByBusRoute,
  isPooledSegment,
  periodSuffix,
  rankLeaderboard,
  segmentDistanceAndTime,
  segmentDwell,
  segmentSpeedRange,
  sharedRouteKeys,
  stopDwellsByRoute,
  summarizeDwell,
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

const routeTotals = (
  route: string,
  overrides: Partial<BusSpeedLeaderboardEntry> = {}
): BusSpeedLeaderboardEntry => ({
  route,
  miles_covered: 100,
  total_time: 36000,
  count: 50,
  n_traversals: 1000,
  total_dwell: 9000,
  n_dwell_stops: 300,
  n_days: 1,
  ...overrides,
});

describe('groupLeaderboardByBusRoute dwell', () => {
  it('pools dwell across the routes behind a label, and keeps their shared days', () => {
    // 749 and 751 are SL5 and SL4, shown together as SL4/SL5.
    const [group] = groupLeaderboardByBusRoute(
      [
        routeTotals('749', { total_dwell: 3000, n_dwell_stops: 100, n_days: 7 }),
        routeTotals('751', { total_dwell: 9000, n_dwell_stops: 200, n_days: 6 }),
      ],
      '2026-11-04'
    );

    expect(group.route).toBe('SL4/SL5');
    expect([group.total_dwell, group.n_dwell_stops, group.n_days]).toEqual([12000, 300, 7]);
    // Weighted by stops, not the 45s mean of the two routes' averages.
    expect(averageDwell(group)).toBe(40);
  });

  it('reads leaderboards computed without dwell as having none', () => {
    const [group] = groupLeaderboardByBusRoute(
      [routeTotals('1', { total_dwell: undefined, n_dwell_stops: undefined, n_days: undefined })],
      '2026-11-04'
    );

    expect([group.total_dwell, group.n_dwell_stops, group.n_days]).toEqual([0, 0, 0]);
  });
});

describe('summarizeDwell', () => {
  const grouped = (entries: BusSpeedLeaderboardEntry[]) =>
    groupLeaderboardByBusRoute(entries, '2026-11-04');

  it('ranks each list by its own measure', () => {
    const summary = summarizeDwell(
      grouped([
        // 30s a stop, 25% of the time.
        routeTotals('1', { total_dwell: 9000, n_dwell_stops: 300, total_time: 36000 }),
        // 40s a stop, 20% of the time: stops far apart.
        routeTotals('2', { total_dwell: 8000, n_dwell_stops: 200, total_time: 40000 }),
        // 20s a stop, 50% of the time: stops close together.
        routeTotals('3', { total_dwell: 10000, n_dwell_stops: 500, total_time: 20000 }),
      ])
    );

    expect(summary.byAverageDwell.map((entry) => entry.route)).toEqual(['2', '1', '3']);
    expect(summary.byDwellShare.map((entry) => entry.route)).toEqual(['3', '1', '2']);
    expect(dwellShare(summary.byDwellShare[0])).toBe(0.5);
  });

  it('leaves out routes serving too few stops a day, but still counts them overall', () => {
    const summary = summarizeDwell(
      grouped([
        routeTotals('1', { total_dwell: 6000, n_dwell_stops: 300, total_time: 30000 }),
        // 150 stops a day over a week: too few, however long its stops are.
        routeTotals('55', { total_dwell: 60000, n_dwell_stops: 1050, n_days: 7, total_time: 1e5 }),
        // 1,400 stops in a week is 200 a day: just enough.
        routeTotals('66', { total_dwell: 42000, n_dwell_stops: 1400, n_days: 7 }),
      ])
    );

    expect(summary.byAverageDwell.map((entry) => entry.route)).toEqual(['66', '1']);
    expect(summary.overall).toEqual({ averageDwell: 108000 / 2750, dwellShare: 108000 / 166000 });
  });

  it('shows at most five routes in each list', () => {
    const entries = Array.from({ length: 8 }, (_, index) => routeTotals(String(index + 1)));

    const summary = summarizeDwell(grouped(entries));

    expect(summary.byAverageDwell).toHaveLength(5);
    expect(summary.byDwellShare).toHaveLength(5);
  });

  it('is empty for a leaderboard computed without dwell', () => {
    const summary = summarizeDwell(
      grouped([
        routeTotals('1', { total_dwell: undefined, n_dwell_stops: undefined, n_days: undefined }),
      ])
    );

    expect(summary).toEqual({ overall: undefined, byAverageDwell: [], byDwellShare: [] });
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

describe('groupLeaderboardByBusRoute fleet', () => {
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
