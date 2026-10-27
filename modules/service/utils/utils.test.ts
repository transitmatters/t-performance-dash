import { describe, expect, it } from 'vitest';
import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';
import { getScheduledAndDeliveredRoundTrips } from './utils';

const delivered = (date: string, count: number): DeliveredTripMetrics =>
  ({ date, count, miles_covered: count ? 100 : 0 }) as DeliveredTripMetrics;

const scheduled = (counts: { date: string; count: number }[]) => ({ counts }) as ScheduledService;

describe('getScheduledAndDeliveredRoundTrips', () => {
  it('matches monthly scheduled (month end) to delivered (month start) as one point', () => {
    const result = getScheduledAndDeliveredRoundTrips(
      [delivered('2026-02-01', 190), delivered('2026-03-01', 186)],
      scheduled([
        { date: '2026-02-28', count: 446 },
        { date: '2026-03-31', count: 414 },
      ]),
      'monthly'
    );

    expect(result).toEqual([
      { date: '2026-02-01', scheduled: 223, delivered: 190 },
      { date: '2026-03-01', scheduled: 207, delivered: 186 },
    ]);
  });

  it('dates a scheduled-only month at the first of the month, with no point', () => {
    const result = getScheduledAndDeliveredRoundTrips(
      [delivered('2026-02-01', 190)],
      scheduled([
        { date: '2026-02-28', count: 446 },
        { date: '2026-03-31', count: 414 },
      ]),
      'monthly'
    );

    expect(result.map(({ date }) => date)).toEqual(['2026-02-01', '2026-03-01']);
    expect(result[1]).toEqual({ date: '2026-03-01', scheduled: NaN, delivered: NaN });
  });

  it('matches daily points by exact date', () => {
    const result = getScheduledAndDeliveredRoundTrips(
      [delivered('2026-03-02', 200), delivered('2026-03-03', 0)],
      scheduled([
        { date: '2026-03-02', count: 420 },
        { date: '2026-03-03', count: 420 },
      ]),
      'daily'
    );

    expect(result).toEqual([
      { date: '2026-03-02', scheduled: 210, delivered: 200 },
      { date: '2026-03-03', scheduled: NaN, delivered: NaN },
    ]);
  });
});
