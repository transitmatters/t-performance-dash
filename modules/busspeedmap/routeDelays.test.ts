import { describe, expect, it } from 'vitest';
import {
  ROUTE_DELAY_BANDS,
  routeDelayRows,
  selectRouteDelayBands,
  tripMinutes,
} from './routeDelays';
import type { BusRouteDelayEntry, BusRouteDelaysByBand, BusRouteDelaysByDayType } from './types';

const entry = (overrides: Partial<BusRouteDelayEntry> = {}): BusRouteDelayEntry => ({
  route_id: '109',
  direction_id: 0,
  n_trips: 64,
  p50_running_time_seconds: 2904,
  free_flow_running_time_seconds: 1476,
  ...overrides,
});

describe('selectRouteDelayBands', () => {
  const byBand: BusRouteDelaysByBand = { pm_peak: [entry()] };

  it('reads a daily file as it is', () => {
    expect(selectRouteDelayBands(byBand, 'daily', 'business_day')).toBe(byBand);
  });

  it('picks the day type from a weekly or monthly file', () => {
    const byDayType: BusRouteDelaysByDayType = { weekend_or_holiday: byBand };
    expect(selectRouteDelayBands(byDayType, 'weekly', 'weekend_or_holiday')).toBe(byBand);
    // A week in progress can be missing a day type altogether.
    expect(selectRouteDelayBands(byDayType, 'monthly', 'business_day')).toEqual({});
  });
});

describe('routeDelayRows', () => {
  it("gives the six bands in order, with the route direction's entry where it has one", () => {
    const pm = entry();
    const bands: BusRouteDelaysByBand = {
      pm_peak: [entry({ direction_id: 1 }), pm, entry({ route_id: '1' })],
      all_day: [entry()],
    };

    const rows = routeDelayRows(bands, '109', 0);

    expect(rows.map(({ band }) => band)).toEqual(ROUTE_DELAY_BANDS);
    expect(rows.map(({ band }) => band)).not.toContain('all_day');
    expect(rows.find(({ band }) => band === 'pm_peak')?.entry).toBe(pm);
    expect(rows.filter(({ entry }) => entry)).toHaveLength(1);
  });
});

describe('tripMinutes', () => {
  it('rounds before subtracting, so the figures add up as shown', () => {
    // 48.4 and 24.6 minutes: 23.8 lost, but shown as 48 against 25, so 23.
    expect(tripMinutes(entry())).toEqual({ running: 48, freeFlow: 25, lost: 23 });
  });

  it('never loses less than nothing', () => {
    const early = entry({ p50_running_time_seconds: 600, free_flow_running_time_seconds: 660 });
    expect(tripMinutes(early)).toEqual({ running: 10, freeFlow: 11, lost: 0 });
  });
});
