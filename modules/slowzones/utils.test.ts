import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { SlowZoneAllSlowResponse, SlowZoneResponse } from '../../common/types/dataPoints';
import { type SlowZoneStats, getSlowZoneStats, slowTimeBadge, zonesBadge } from './utils';

dayjs.extend(utc);

const zone = (fr_id: string, to_id: string, start: string, end: string, delay: number) =>
  ({
    color: 'Red',
    fr_id,
    to_id,
    start: `${start}T00:00:00`,
    end: `${end}T00:00:00`,
    delay,
    mean_metric: 0,
    duration: 0,
    baseline: 0,
    latest_delay: delay,
    previous_delay: delay,
  }) satisfies SlowZoneResponse;

// Southbound JFK/UMass (Braintree) to North Quincy, still slow on the last day of data.
const jfkToNorthQuincy = zone('70095', '70097', '2026-11-01', '2026-11-18', 27);
// Southbound Alewife to Davis, cleared the day before.
const alewifeToDavis = zone('70061', '70063', '2026-11-01', '2026-11-17', 90);

// What the site had at 00:10 ET on Nov 20: the run on the morning of Nov 19, covering service
// through Nov 18. The next run, at about 5 AM ET, adds Nov 19.
const allSlow: SlowZoneAllSlowResponse = {
  updated_on: '2026-11-19T10:06:00+00:00',
  data: [jfkToNorthQuincy, alewifeToDavis],
};
const delayTotals = [
  { date: '2026-11-17', Red: 117, Orange: 0, Blue: 0, Green: 0, Mattapan: 0 },
  { date: '2026-11-18', Red: 27, Orange: 0, Blue: 0, Green: 0, Mattapan: 0 },
];

describe.each(['America/New_York', 'Europe/Paris'])('getSlowZoneStats, viewed in %s', (tz) => {
  beforeAll(() => {
    vi.stubEnv('TZ', tz);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime('2026-11-20T05:10:00Z');
  });
  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  const statsFor = (startDate: string, endDate: string) =>
    getSlowZoneStats(delayTotals, allSlow, dayjs.utc(startDate), dayjs.utc(endDate), 'Red');

  it('counts zones still slow on the last day of data, before the morning run', () => {
    expect(statsFor('2026-11-14', '2026-11-20')).toMatchObject({
      currentSlowTime: 27,
      activeZones: 1,
      worstSegment: { title: 'JFK-N. Quincy', delay: 27 },
    });
  });

  it('counts zones active on a past end date', () => {
    expect(statsFor('2026-11-10', '2026-11-17')).toMatchObject({
      activeZones: 2,
      worstSegment: { title: 'Alewife-Davis', delay: 90 },
    });
  });
});

const stats = (overrides: Partial<SlowZoneStats>): SlowZoneStats => ({
  currentSlowTime: 0,
  slowTimeDelta: 0,
  activeZones: 0,
  zonesDelta: 0,
  worstSegment: null,
  ...overrides,
});

describe('slowTimeBadge', () => {
  it('compares the first and last day of the range', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 300, slowTimeDelta: 120 }))).toEqual({
      label: '+2m 00s · worse',
      sentiment: 'bad',
      detail: '3m 00s → 5m 00s, start vs. end of the selected dates',
    });
  });

  it('reads less slow time as better', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 30, slowTimeDelta: -90 }))).toMatchObject({
      label: '−90s · better',
      sentiment: 'good',
    });
  });

  it('reads a change of a minute or less as flat', () => {
    expect(slowTimeBadge(stats({ currentSlowTime: 100, slowTimeDelta: 45 }))?.sentiment).toBe(
      'flat'
    );
  });
});

describe('zonesBadge', () => {
  it('compares the zone count at the start and end of the range', () => {
    expect(zonesBadge(stats({ activeZones: 3, zonesDelta: 2 }))).toEqual({
      label: '+2 · worse',
      sentiment: 'bad',
      detail: '1 → 3, start vs. end of the selected dates',
    });
  });

  it('reads no change as flat', () => {
    expect(zonesBadge(stats({ activeZones: 3, zonesDelta: 0 }))).toMatchObject({
      label: '0 · flat',
      sentiment: 'flat',
    });
  });
});
