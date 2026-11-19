import { afterEach, describe, expect, it, vi } from 'vitest';

/** dates.ts reads today when it loads, so load it fresh with the clock set. */
const loadOn = async (today: string) => {
  vi.useFakeTimers({ now: new Date(`${today}T12:00:00-05:00`) });
  vi.resetModules();
  return import('./dates');
};

afterEach(() => {
  vi.useRealTimers();
});

describe('getBusRouteService', () => {
  it('counts a route as retired once its last day has passed', async () => {
    const { getBusRouteService } = await loadOn('2026-11-18');
    expect(getBusRouteService('110-legacy')).toEqual({
      start: undefined,
      end: '2024-12-14',
      retired: true,
    });
  });

  it('counts a route with an end date still to come as running', async () => {
    const { getBusRouteService } = await loadOn('2024-12-01');
    expect(getBusRouteService('110-legacy').retired).toBe(false);
  });

  it('counts a route with no end date as running', async () => {
    const { getBusRouteService } = await loadOn('2026-11-18');
    expect(getBusRouteService('110')).toEqual({
      start: '2024-12-15',
      end: undefined,
      retired: false,
    });
  });
});
