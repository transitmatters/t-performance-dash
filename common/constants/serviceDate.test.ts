import dayjs from 'dayjs';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

/** dates.ts reads the clock when it loads, so load it fresh with the clock set. */
const loadAt = async (instant: string) => {
  vi.useFakeTimers({ now: new Date(instant) });
  vi.resetModules();
  return import('./dates');
};

afterEach(() => {
  vi.useRealTimers();
});

// Readers' browsers can be anywhere, so the service day has to come out the same in each.
describe.each(['America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'])(
  'getServiceDate in %s',
  (tz) => {
    beforeAll(() => {
      vi.stubEnv('TZ', tz);
    });
    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it.each([
      ['2026-11-20T00:30:00-05:00', '2026-11-19'],
      ['2026-11-20T02:59:00-05:00', '2026-11-19'],
      ['2026-11-20T03:00:00-05:00', '2026-11-20'],
      ['2026-11-20T23:59:00-05:00', '2026-11-20'],
      // The night clocks fall back: 1:30 AM EST comes after 1:30 AM EDT and is still the day before
      ['2026-11-01T01:30:00-05:00', '2026-10-31'],
      ['2026-11-01T03:00:00-05:00', '2026-11-01'],
      // The night clocks spring forward, 2 AM EST is 3 AM EDT
      ['2027-03-14T01:59:00-05:00', '2027-03-13'],
      ['2027-03-14T03:00:00-04:00', '2027-03-14'],
    ])('puts %s in the service day of %s', async (instant, expected) => {
      const { getServiceDate } = await import('./dates');
      expect(getServiceDate(dayjs(instant))).toBe(expected);
    });
  }
);

describe('SERVICE_DATE_STRING', () => {
  it('is still yesterday before 3 AM, while its service runs', async () => {
    const dates = await loadAt('2026-11-20T00:30:00-05:00');
    expect(dates.TODAY_STRING).toBe('2026-11-20');
    expect(dates.SERVICE_DATE_STRING).toBe('2026-11-19');
    expect(dates.PREVIOUS_SERVICE_DATE_STRING).toBe('2026-11-18');
  });

  it('is today from 3 AM', async () => {
    const dates = await loadAt('2026-11-20T03:00:00-05:00');
    expect(dates.SERVICE_DATE_STRING).toBe('2026-11-20');
    expect(dates.PREVIOUS_SERVICE_DATE_STRING).toBe('2026-11-19');
  });
});
