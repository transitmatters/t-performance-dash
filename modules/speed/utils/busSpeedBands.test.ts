import { describe, expect, it } from 'vitest';
import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import {
  DEFAULT_VISIBLE_BANDS,
  bandMph,
  flattenBandsForCsv,
  parseVisibleBands,
  serializeVisibleBands,
} from './busSpeedBands';

const row = (overrides: Partial<DeliveredTripMetricsBus> = {}): DeliveredTripMetricsBus => ({
  route: '1',
  date: '2026-01-05',
  count: 40,
  n_traversals: 900,
  n_interpolated: 9,
  miles_covered: 100,
  total_time: 36000,
  time_bands: {
    am_peak: {
      count: 8,
      n_traversals: 200,
      n_interpolated: 2,
      miles_covered: 20,
      total_time: 9000,
    },
    late_night: { count: 0, n_traversals: 0, n_interpolated: 0, miles_covered: 0, total_time: 0 },
  },
  ...overrides,
});

describe('parseVisibleBands', () => {
  it('shows every line when the param is missing', () => {
    expect(parseVisibleBands(undefined)).toEqual(DEFAULT_VISIBLE_BANDS);
  });

  it('keeps known keys in chronological order and drops the rest', () => {
    expect(parseVisibleBands('pm_peak,rush_hour,all_day,am_peak')).toEqual([
      'all_day',
      'am_peak',
      'pm_peak',
    ]);
  });

  it('falls back to the default rather than an empty chart', () => {
    expect(parseVisibleBands('rush_hour')).toEqual(DEFAULT_VISIBLE_BANDS);
    expect(parseVisibleBands('')).toEqual(DEFAULT_VISIBLE_BANDS);
  });
});

describe('serializeVisibleBands', () => {
  it('writes nothing for the default selection, in any order', () => {
    expect(serializeVisibleBands([...DEFAULT_VISIBLE_BANDS].reverse())).toBeUndefined();
  });

  it('round-trips a narrowed selection', () => {
    const value = serializeVisibleBands(['pm_peak', 'am_peak']);
    expect(value).toBe('am_peak,pm_peak');
    expect(parseVisibleBands(value)).toEqual(['am_peak', 'pm_peak']);
  });
});

describe('bandMph', () => {
  it('uses the row totals for All day and the band totals otherwise', () => {
    expect(bandMph(row(), 'all_day')).toBe(10);
    expect(bandMph(row(), 'am_peak')).toBe(8);
  });

  it('leaves a gap for a band with no miles, a missing band, or no breakdown at all', () => {
    expect(bandMph(row(), 'late_night')).toBeNull();
    expect(bandMph(row(), 'midday')).toBeNull();
    expect(bandMph(row({ time_bands: undefined }), 'am_peak')).toBeNull();
  });
});

describe('flattenBandsForCsv', () => {
  it('swaps the nested map for one mph column per line', () => {
    const [flat] = flattenBandsForCsv([row()]);
    expect(flat).not.toHaveProperty('time_bands');
    expect(flat).toMatchObject({
      miles_per_hour: 10,
      am_peak_mph: 8,
      midday_mph: '',
      late_night_mph: '',
    });
  });
});
