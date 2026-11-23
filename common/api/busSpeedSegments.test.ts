import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TWO_DAYS_AGO_STRING, YESTERDAY_STRING } from '../constants/dates';
import {
  BusSpeedDataUnavailableError,
  busDwellsPath,
  busRouteDelaysPath,
  busSpeedSegmentsPath,
  fetchBusDwellsUrl,
  fetchBusRouteDelays,
  fetchBusSpeedSegmentsUrl,
} from './busSpeedSegments';

const BASE = '/businsights/BusSpeedSegments';
const BANDS = ['early_am', 'am_peak', 'midday', 'pm_peak', 'evening', 'late_night'] as const;

describe('busSpeedSegmentsPath', () => {
  it('puts all_day in its own archive for each period', () => {
    expect(busSpeedSegmentsPath('2026-09-03', 'daily', 'all_day')).toBe(
      `${BASE}/daily/Year=2026/Month=9/Day=3/segments_all_day.pmtiles`
    );
    expect(busSpeedSegmentsPath('2026-09-03', 'weekly', 'all_day')).toBe(
      `${BASE}/weekly/Year=2026/Week=36/segments_all_day.pmtiles`
    );
    expect(busSpeedSegmentsPath('2026-09-03', 'monthly', 'all_day')).toBe(
      `${BASE}/monthly/Year=2026/Month=9/segments_all_day.pmtiles`
    );
  });

  it('keeps every time band in the shared archive', () => {
    for (const band of BANDS) {
      expect(busSpeedSegmentsPath('2026-09-03', 'daily', band)).toBe(
        `${BASE}/daily/Year=2026/Month=9/Day=3/segments.pmtiles`
      );
    }
  });

  it('files all_day under the ISO week year', () => {
    // 2027-01-01 is a Friday, so it belongs to ISO week 53 of 2026.
    expect(busSpeedSegmentsPath('2027-01-01', 'weekly', 'all_day')).toBe(
      `${BASE}/weekly/Year=2026/Week=53/segments_all_day.pmtiles`
    );
  });
});

describe('busDwellsPath', () => {
  it('sits beside the segments, split by band and all_day the same way', () => {
    expect(busDwellsPath('2026-11-04', 'daily', 'am_peak')).toBe(
      `${BASE}/daily/Year=2026/Month=11/Day=4/dwells.pmtiles`
    );
    expect(busDwellsPath('2026-11-04', 'daily', 'all_day')).toBe(
      `${BASE}/daily/Year=2026/Month=11/Day=4/dwells_all_day.pmtiles`
    );
    expect(busDwellsPath('2026-11-04', 'weekly', 'midday')).toBe(
      `${BASE}/weekly/Year=2026/Week=45/dwells.pmtiles`
    );
    expect(busDwellsPath('2026-11-04', 'monthly', 'all_day')).toBe(
      `${BASE}/monthly/Year=2026/Month=11/dwells_all_day.pmtiles`
    );
  });
});

describe('fetchBusSpeedSegmentsUrl', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('checks the all_day archive', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const url = await fetchBusSpeedSegmentsUrl({
      date: '2026-09-03',
      period: 'monthly',
      timeBand: 'all_day',
    });
    expect(url).toBe(
      `https://dashboard.transitmatters.org${BASE}/monthly/Year=2026/Month=9/segments_all_day.pmtiles`
    );
    expect(fetchMock).toHaveBeenCalledWith(url, { method: 'HEAD' });
  });

  it('reports a missing all_day archive as unavailable, not an error', async () => {
    // Every date before the pipeline's all-day backfill.
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    await expect(
      fetchBusSpeedSegmentsUrl({ date: '2026-01-15', period: 'daily', timeBand: 'all_day' })
    ).rejects.toBeInstanceOf(BusSpeedDataUnavailableError);
  });
});

describe('fetchBusDwellsUrl', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('checks the band archive', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const url = await fetchBusDwellsUrl({
      date: '2026-11-04',
      period: 'daily',
      timeBand: 'am_peak',
    });
    expect(url).toBe(
      `https://dashboard.transitmatters.org${BASE}/daily/Year=2026/Month=11/Day=4/dwells.pmtiles`
    );
    expect(fetchMock).toHaveBeenCalledWith(url, { method: 'HEAD' });
  });

  it('resolves to null for an archive from before there was a dwell layer', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    await expect(
      fetchBusDwellsUrl({ date: '2026-10-01', period: 'daily', timeBand: 'am_peak' })
    ).resolves.toBeNull();
  });

  it('throws on any other failure', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(
      fetchBusDwellsUrl({ date: '2026-11-04', period: 'daily', timeBand: 'am_peak' })
    ).rejects.toThrow();
  });
});

describe('busRouteDelaysPath', () => {
  it('sits beside the leaderboard, one file a period', () => {
    expect(busRouteDelaysPath('2026-11-04', 'daily')).toBe(
      `${BASE}/daily/Year=2026/Month=11/Day=4/route_delays.json`
    );
    expect(busRouteDelaysPath('2026-11-04', 'weekly')).toBe(
      `${BASE}/weekly/Year=2026/Week=45/route_delays.json`
    );
    expect(busRouteDelaysPath('2026-10-15', 'monthly')).toBe(
      `${BASE}/monthly/Year=2026/Month=10/route_delays.json`
    );
  });
});

describe('fetchBusRouteDelays', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("reads the period's file", async () => {
    const body = { pm_peak: [] };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
    await expect(fetchBusRouteDelays({ date: '2026-11-04', period: 'weekly' })).resolves.toEqual(
      body
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `https://dashboard.transitmatters.org${BASE}/weekly/Year=2026/Week=45/route_delays.json`
    );
  });

  it.each([403, 404])(
    'resolves to null for an archive published before there were route delays (%i)',
    async (status) => {
      fetchMock.mockResolvedValue(new Response(null, { status }));
      await expect(
        fetchBusRouteDelays({ date: '2026-09-15', period: 'monthly' })
      ).resolves.toBeNull();
    }
  );

  it('throws on any other failure', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(fetchBusRouteDelays({ date: '2026-11-04', period: 'daily' })).rejects.toThrow();
  });
});

describe('getLatestBusSpeedDate', () => {
  const fetchMock = vi.fn();
  // The result is cached per module, so each case loads a fresh copy.
  const latest = async () => (await import('./busSpeedSegments')).getLatestBusSpeedDate();

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("opens on yesterday once yesterday's segments are out", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    await expect(latest()).resolves.toBe(YESTERDAY_STRING);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://dashboard.transitmatters.org${busSpeedSegmentsPath(YESTERDAY_STRING, 'daily', 'all_day')}`,
      { method: 'HEAD' }
    );
  });

  it('falls back to the day before while yesterday is missing or the check fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    await expect(latest()).resolves.toBe(TWO_DAYS_AGO_STRING);
    vi.resetModules();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(latest()).resolves.toBe(TWO_DAYS_AGO_STRING);
  });

  it('only checks once', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { getLatestBusSpeedDate } = await import('./busSpeedSegments');
    await getLatestBusSpeedDate();
    await getLatestBusSpeedDate();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
