import dayjs from 'dayjs';
import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import { BUS_FLEET_THRESHOLDS } from '../config';
import type { Cell } from '../types';
import { judgedCell, naCell } from './cells';
import { takeWindow } from './series';

/** Weeks averaged for the score, like the rail fleet cell. */
const RECENT_WEEKS = 4;

const weekStart = (date: string) => {
  const day = dayjs(date.slice(0, 10));
  return day.subtract((day.day() + 6) % 7, 'day').format('YYYY-MM-DD');
};

interface Totals {
  trips: number;
  battery: number;
  hybrid: number;
  ageTrips: number;
  ageSum: number;
}

const addRow = (totals: Totals, row: DeliveredTripMetricsBus) => {
  const trips = row.fleet_trips ?? 0;
  totals.trips += trips;
  totals.battery += (trips * (row.fleet_mix_battery ?? 0)) / 100;
  totals.hybrid += (trips * (row.fleet_mix_hybrid ?? 0)) / 100;
  if (row.avg_bus_age !== undefined) {
    totals.ageTrips += trips;
    totals.ageSum += trips * row.avg_bus_age;
  }
};

const emptyTotals = (): Totals => ({ trips: 0, battery: 0, hybrid: 0, ageTrips: 0, ageSum: 0 });

/**
 * Share of bus trips on battery-electric or hybrid buses, weighted by trips, from the daily
 * system-wide fleet rows. `rows` is null when they couldn't be loaded.
 */
export const busFleetCell = (
  rows: DeliveredTripMetricsBus[] | null,
  opts: { now: Date; href?: string }
): Cell => {
  if (rows === null) {
    return { ...naCell('fleet', 'pct', "Couldn't load bus fleet data."), status: 'insufficient' };
  }

  const weeks = new Map<string, Totals>();
  for (const row of rows) {
    if (!row.fleet_trips) continue;
    const key = weekStart(row.date);
    if (!weeks.has(key)) weeks.set(key, emptyTotals());
    addRow(weeks.get(key)!, row);
  }
  const ordered = [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b));
  const window = takeWindow(
    ordered.map(([date, t]) => ({ date, value: (t.battery + t.hybrid) / t.trips })),
    false
  );

  const recent = emptyTotals();
  for (const [, week] of ordered.slice(-RECENT_WEEKS)) {
    for (const key of Object.keys(recent) as (keyof Totals)[]) recent[key] += week[key];
  }
  const share = (part: number) => (recent.trips ? part / recent.trips : null);
  const score = share(recent.battery + recent.hybrid);
  const pct = (part: number) => `${Math.round((share(part) ?? 0) * 100)}%`;

  return {
    ...judgedCell('fleet', score, {
      unit: 'pct',
      window,
      now: opts.now,
      minPoints: RECENT_WEEKS,
      direction: 'higher',
      thresholds: BUS_FLEET_THRESHOLDS,
      secondary: recent.trips
        ? `Battery ${pct(recent.battery)} · Hybrid ${pct(recent.hybrid)} of trips`
        : undefined,
      baselineLabel: recent.ageTrips
        ? `Average bus age: ${Math.round(recent.ageSum / recent.ageTrips)} yr`
        : undefined,
      notes: recent.trips ? undefined : ['No recent fleet data.'],
      href: opts.href,
    }),
    // A fleet shifts over years, so a 2-week trend says nothing here.
    trend: null,
    spark: undefined,
  };
};
