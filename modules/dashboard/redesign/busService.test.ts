import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { BusTripCounts } from '../../../common/types/dataPoints';
import {
  buildBusServiceRow,
  formatDeliveredPct,
  mayIncludeTrackingGaps,
  summarizeBusService,
} from './busService';

type Row = BusTripCounts & { date: string };

const trips = (scheduled: number, dropped: number, waived = 0): BusTripCounts => ({
  scheduled_trips: scheduled,
  unobserved_trips: dropped,
  unobserved_waived_trips: waived,
});

/** `count` days of identical counts, ending on `end`. */
const days = (end: string, count: number, counts: BusTripCounts): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    date: dayjs(end)
      .subtract(count - 1 - i, 'day')
      .format('YYYY-MM-DD'),
    ...counts,
  }));

describe('summarizeBusService', () => {
  it('splits the last 30 days with counts from the 30 before', () => {
    const rows = [
      ...days('2026-10-08', 30, trips(100, 2)),
      ...days('2026-11-07', 30, trips(100, 1)),
    ];
    const summary = summarizeBusService(rows)!;
    expect(summary.end).toBe('2026-11-07');
    expect(summary.days).toHaveLength(30);
    expect(summary.days[0].date).toBe('2026-10-09');
    expect(summary.current).toEqual({ scheduled: 3000, dropped: 30, waived: 0 });
    expect(summary.prior).toEqual({ scheduled: 3000, dropped: 60, waived: 0 });
  });

  it('ends at the last day with counts, even one with no speed fields', () => {
    // A day where every trip went unobserved has counts but no miles_covered.
    const rows: Row[] = [
      { date: '2026-11-06', ...trips(200, 1) },
      { date: '2026-11-07', ...trips(200, 200) },
      // The feed hasn't filled in today yet
      { date: '2026-11-08' },
    ];
    const summary = summarizeBusService(rows)!;
    expect(summary.end).toBe('2026-11-07');
    expect(summary.current.dropped).toBe(201);
  });

  it('is null before the counts begin', () => {
    expect(summarizeBusService([{ date: '2025-12-20' }, { date: '2025-12-21' }])).toBeNull();
    expect(summarizeBusService([])).toBeNull();
  });

  it('has no prior window when the counts are newer than 30 days', () => {
    expect(summarizeBusService(days('2026-01-10', 18, trips(100, 1)))!.prior).toBeNull();
  });
});

describe('buildBusServiceRow', () => {
  const build = (rows: Row[], weekly: Row[] = []) =>
    buildBusServiceRow(summarizeBusService(rows)!, weekly, '#ffc72c');

  it('pools trips rather than averaging days', () => {
    // 10% of a busy weekday dropped, none of a 10-trip Sunday. Averaging the days would say 95%.
    const row = build([
      { date: '2026-11-07', ...trips(100, 10) },
      { date: '2026-11-08', ...trips(10, 0) },
    ]);
    expect(row.currentValue).toBeCloseTo((100 * 100) / 110);
    expect(row.formattedCurrent).toBe('90.9%');
    expect(row.subtitle).toBe('10 of 110 trips dropped (est.)');
  });

  it('calls a change within chance flat', () => {
    // A month of 200 trips a day: 0.5% dropped against 0.6%, six trips apart
    const row = build([
      { date: '2026-10-08', ...trips(6000, 36) },
      { date: '2026-11-07', ...trips(6000, 30) },
    ]);
    expect(row.deltaSentiment).toBe('flat');
    expect(row.deltaLabel).toBe('+0.1 pts · flat');
    expect(row.deltaValueLabel).toBe('+0.1');
  });

  it('calls a change beyond chance worse', () => {
    // 0.5% dropped against 3%
    const row = build([
      { date: '2026-10-08', ...trips(6000, 30) },
      { date: '2026-11-07', ...trips(6000, 180) },
    ]);
    expect(row.deltaSentiment).toBe('bad');
    expect(row.deltaLabel).toBe('-2.5 pts · worse');
  });

  it("doesn't print -0.0 for a change that rounds away", () => {
    const row = build([
      { date: '2026-10-08', ...trips(600000, 3000) },
      { date: '2026-11-07', ...trips(600000, 3010) },
    ]);
    expect(row.deltaValueLabel).toBe('0.0');
  });

  it('says when there is no prior window', () => {
    const row = build(days('2026-01-10', 18, trips(100, 1)));
    expect(row.deltaLabel).toBe('Not enough data');
    expect(row.deltaSentiment).toBe('flat');
  });

  it('pools the monthly trend from weekly rows, skipping weeks before the counts', () => {
    const weekly: Row[] = [
      { date: '2025-12-15' },
      { date: '2025-12-22', ...trips(500, 5) },
      { date: '2025-12-29', ...trips(1500, 0) },
      { date: '2026-01-05', ...trips(1000, 10) },
    ];
    const row = build(days('2026-01-10', 18, trips(100, 1)), weekly);
    expect(row.trend).toEqual([100 * (1 - 5 / 2000), 99]);
  });
});

describe('formatDeliveredPct', () => {
  it("doesn't round up to 100% while any trip was dropped", () => {
    expect(formatDeliveredPct(99.96)).toBe('99.9%');
    expect(formatDeliveredPct(100)).toBe('100%');
    expect(formatDeliveredPct(99.44)).toBe('99.4%');
  });
});

describe('mayIncludeTrackingGaps', () => {
  it('flags many unobserved trips with few waivers', () => {
    expect(mayIncludeTrackingGaps({ scheduled: 1854, dropped: 257, waived: 0 })).toBe(true);
    expect(mayIncludeTrackingGaps({ scheduled: 7378, dropped: 24, waived: 1 })).toBe(true);
  });

  it('leaves alone routes with waivers or too few trips to judge', () => {
    expect(mayIncludeTrackingGaps({ scheduled: 6450, dropped: 30, waived: 12 })).toBe(false);
    expect(mayIncludeTrackingGaps({ scheduled: 1500, dropped: 9, waived: 0 })).toBe(false);
  });
});
