import { describe, expect, it } from 'vitest';
import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import { busFleetCell } from './busFleet';

const now = new Date('2026-10-11T12:00:00Z');

/** One system-wide row a day from `start`, for `days` days. */
const rows = (
  start: string,
  days: number,
  fields: Partial<DeliveredTripMetricsBus>
): DeliveredTripMetricsBus[] =>
  Array.from({ length: days }, (_, i) => {
    const date = new Date(`${start}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    return { date: date.toISOString().slice(0, 10), route: 'all', ...fields };
  }) as DeliveredTripMetricsBus[];

describe('busFleetCell', () => {
  it('weights the battery and hybrid share by trips over the last 4 weeks', () => {
    const cell = busFleetCell(
      [
        // Older weeks fall outside the 4-week score.
        ...rows('2026-08-03', 14, { fleet_trips: 100, fleet_mix_hybrid: 0, avg_bus_age: 20 }),
        // 26 quiet days at 50% and one busy day at 90% weight to 79%, not the 52% a plain mean gives.
        ...rows('2026-09-14', 26, { fleet_trips: 1, fleet_mix_hybrid: 50, avg_bus_age: 9 }),
        ...rows('2026-10-10', 1, { fleet_trips: 900, fleet_mix_battery: 10, fleet_mix_hybrid: 80 }),
      ],
      { now }
    );
    const trips = 26 + 900;
    expect(cell.score).toBeCloseTo((26 * 0.5 + 900 * 0.9) / trips);
    expect(cell.unit).toBe('pct');
    expect(cell.direction).toBe('higher');
    expect(cell.secondary).toBe('Battery 10% · Hybrid 79% of trips');
    expect(cell.baselineLabel).toBe('Average bus age: 9 yr');
    expect(cell.trend).toBeNull();
    expect(cell.status).toBe('good');
  });

  it('needs 4 weeks of data for a status', () => {
    const cell = busFleetCell(rows('2026-09-21', 20, { fleet_trips: 100, fleet_mix_hybrid: 95 }), {
      now,
    });
    expect(cell.status).toBe('insufficient');
    expect(cell.score).toBeCloseTo(0.95);
  });

  it('says so when the data could not be loaded', () => {
    const cell = busFleetCell(null, { now });
    expect(cell.status).toBe('insufficient');
    expect(cell.notes).toEqual(["Couldn't load bus fleet data."]);
  });

  it('reads "Not enough data" when no rows carry fleet trips', () => {
    const cell = busFleetCell(rows('2026-09-01', 30, {}), { now });
    expect(cell.status).toBe('insufficient');
    expect(cell.score).toBeNull();
    expect(cell.notes).toContain('No recent fleet data.');
  });
});
