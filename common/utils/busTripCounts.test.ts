import { describe, expect, it } from 'vitest';
import { mayIncludeTrackingGaps, sumTrips } from './busTripCounts';

describe('sumTrips', () => {
  it('adds up each count, reading a missing one as none', () => {
    expect(
      sumTrips([
        { scheduled_trips: 100, unobserved_trips: 3, unobserved_waived_trips: 1 },
        { scheduled_trips: 50, unobserved_trips: 2 },
        {},
      ])
    ).toEqual({ scheduled: 150, dropped: 5, waived: 1 });
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
