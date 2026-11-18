import { describe, expect, it } from 'vitest';

import type { SingleDayDataPoint } from '../../common/types/charts';
import { HERO_STATIONS, minutesText, pickHero, worstLabel } from './heroChart';

const trip = (headwayMin: number, scheduledMin = 5, at = '2026-11-16T08:00:00') =>
  ({
    route_id: 'Red',
    direction: 0,
    current_dep_dt: at,
    headway_time_sec: headwayMin * 60,
    benchmark_headway_time_sec: scheduledMin * 60,
  }) as SingleDayDataPoint;

/** `n` trips, `bad` of them bunched. */
const day = (n: number, bad: number) => Array.from({ length: n }, (_, i) => trip(i < bad ? 2 : 5));

const [red, orange, blue, green] = HERO_STATIONS;

describe('HERO_STATIONS', () => {
  it('watches one downtown platform per line, all heading the same way', () => {
    expect(HERO_STATIONS.map((s) => [s.from.stop_name, s.stopIds])).toEqual([
      ['Park Street', ['70076']],
      ['Downtown Crossing', ['70021']],
      ['State Street', ['70042']],
      ['Park Street', ['70200']],
    ]);
  });
});

describe('pickHero', () => {
  it('picks the line with the largest share of bad trips, not the most', () => {
    const pick = pickHero([
      { station: red, rows: day(100, 30) },
      { station: green, rows: day(400, 80) }, // more bad trips, smaller share
      { station: orange, rows: day(100, 5) },
    ]);
    expect(pick?.station.line).toBe('line-red');
    expect([pick?.bad, pick?.judged]).toEqual([30, 100]);
  });

  it('counts long gaps as bad, and skips lines with too little data', () => {
    const gaps = [...day(30, 0), trip(8), trip(8), trip(8), trip(8), trip(8), trip(8)]; // 1.6x
    const pick = pickHero([
      { station: blue, rows: gaps },
      { station: red, rows: day(10, 9) }, // 90% bad, but only 10 trips
      { station: orange, rows: undefined },
    ]);
    expect(pick?.station.line).toBe('line-blue');
    expect(pick?.bad).toBe(6);
  });

  it('calls out the wait that ran furthest over its schedule, in minutes', () => {
    const rows = [
      ...day(30, 0),
      trip(7, 1), // 7x the schedule but only 6 minutes over
      trip(14, 2.5, '2026-11-16T18:05:00'), // 11.5 minutes over
    ];
    const pick = pickHero([{ station: red, rows }]);
    expect(pick?.worst).toBe(31);
    expect(worstLabel(rows[31])).toBe('14-min wait at 6:05 PM');
    expect(minutesText(rows[31].benchmark_headway_time_sec ?? 0)).toBe('2.5');
  });

  it('has nothing to show without data', () => {
    expect(pickHero([{ station: red, rows: [] }])).toBeUndefined();
  });
});
