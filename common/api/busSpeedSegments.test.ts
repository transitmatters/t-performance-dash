import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BusSpeedDataUnavailableError,
  busSpeedSegmentsPath,
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
