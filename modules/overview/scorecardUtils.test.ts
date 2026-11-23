import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import type { RidershipCount } from '../../common/types/dataPoints';
import { getWeekStart } from '../../common/utils/date';
import {
  WINDOW_START,
  YEAR_OVER_YEAR_START,
  buildRidershipRow,
  getOverviewWindow,
  toSlot,
  trailingWindowLabel,
} from './scorecardUtils';
import type { SlotQuery } from './scorecardUtils';

/** Weekly ridership from YEAR_OVER_YEAR_START to two weeks ago, like the bus feed. */
const ridership = (count: (weeksAgo: number) => number): RidershipCount[] => {
  const end = dayjs().subtract(14, 'day').day(1);
  const points: RidershipCount[] = [];
  for (let date = end, weeksAgo = 0; !date.isBefore(YEAR_OVER_YEAR_START); weeksAgo++) {
    points.unshift({ date: date.format('YYYY-MM-DD'), count: count(weeksAgo) });
    date = date.subtract(1, 'week');
  }
  return points;
};

describe('buildRidershipRow', () => {
  it('leaves the year-over-year and peak fields off unless asked (subway, commuter rail)', () => {
    const row = buildRidershipRow(
      ridership(() => 1000),
      '#000'
    );
    expect(row?.yearOverYear).toBeUndefined();
    expect(row?.peakLabel).toBeUndefined();
  });

  it('adds the change from a year ago and the share of peak', () => {
    const data = ridership((weeksAgo) => (weeksAgo <= 4 ? 1100 : 1000));
    const row = buildRidershipRow(data, '#000', { yearOverYear: true, peak: 2000 });
    expect(row?.formattedCurrent).toBe('1.1k');
    expect(row?.yearOverYear).toEqual({
      label: '+10% vs a year ago',
      shortLabel: '+10% YoY',
      sentiment: 'good',
    });
    expect(row?.peakLabel).toBe('55% of peak');
  });

  it("says when there's no data a year ago", () => {
    const data = ridership(() => 1000).slice(-30);
    const row = buildRidershipRow(data, '#000', { yearOverYear: true });
    expect(row?.yearOverYear?.label).toBe('No data a year ago');
  });

  it('keeps the extra year-over-year history out of the sparkline', () => {
    // Values that differ by month, so an extra month at the start would change the trend.
    const data = ridership((weeksAgo) => 1000 + weeksAgo * 10);
    const windowOnly = data.filter((point) => point.date >= getWeekStart(WINDOW_START));
    expect(windowOnly.length).toBeLessThan(data.length);
    expect(buildRidershipRow(data, '#000', { yearOverYear: true })?.trend).toEqual(
      buildRidershipRow(windowOnly, '#000')?.trend
    );
  });
});

describe('buildRidershipRow for a retired route', () => {
  it("keeps the route's final year in the sparkline", () => {
    const { windowStart } = getOverviewWindow('2024-12-14');
    const data = Array.from({ length: 70 }, (_, i) => ({
      date: dayjs('2024-12-09').subtract(i, 'week').format('YYYY-MM-DD'),
      count: 3000,
    })).toReversed();
    expect(buildRidershipRow(data, '#000')).toBeNull();
    const row = buildRidershipRow(data, '#000', { yearOverYear: true, windowStart });
    expect(row?.formattedCurrent).toBe('3.0k');
    expect(row?.yearOverYear?.label).toBe('0% vs a year ago');
  });
});

describe('getOverviewWindow', () => {
  it('ends on the given day', () => {
    expect(getOverviewWindow('2024-12-14')).toEqual({
      end: '2024-12-14',
      windowStart: '2023-11-10',
      yearOverYearStart: '2023-10-05',
      chartFetchStart: '2024-10-15',
    });
  });

  it("starts no earlier than the route's first day", () => {
    expect(getOverviewWindow('2026-11-18', '2026-09-06')).toEqual({
      end: '2026-11-18',
      windowStart: '2026-09-06',
      yearOverYearStart: '2026-09-06',
      chartFetchStart: '2026-09-19',
    });
  });
});

describe('trailingWindowLabel', () => {
  it('reads as the last 30 days while the data is current', () => {
    expect(trailingWindowLabel(dayjs().subtract(3, 'day').format('YYYY-MM-DD'))).toBe(
      'last 30 days'
    );
  });

  it('names the end date when the data is well behind today', () => {
    const end = dayjs().subtract(60, 'day');
    expect(trailingWindowLabel(end.format('YYYY-MM-DD'))).toBe(`30 days to ${end.format('MMM D')}`);
  });
});

describe('toSlot', () => {
  const meta = { key: 'speed', label: 'Speed', subtitle: 'Average' } as const;
  const row = buildRidershipRow(
    ridership(() => 1000),
    '#000'
  );
  const query = (overrides: Partial<SlotQuery> = {}): SlotQuery => ({
    data: undefined,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });

  it('is loading until its data arrives', () => {
    expect(toSlot(meta, [query({ isFetching: true })], () => row).status).toBe('loading');
  });

  it('waits for every query it needs', () => {
    const slot = toSlot(meta, [query({ data: [] }), query({ isFetching: true })], () => row);
    expect(slot.status).toBe('loading');
  });

  it('waits while asked to, even with its data', () => {
    expect(toSlot(meta, [query({ data: [] })], () => row, true).status).toBe('loading');
  });

  it('is ready with the built row', () => {
    const slot = toSlot(meta, [query({ data: [] })], () => row);
    expect(slot.status).toBe('ready');
    expect(slot.row).toBe(row);
  });

  it('is empty when the data builds no row', () => {
    expect(toSlot(meta, [query({ data: [] })], () => null).status).toBe('empty');
  });

  it('keeps data a later refetch failed to replace', () => {
    expect(toSlot(meta, [query({ data: [], isError: true })], () => row).status).toBe('ready');
  });

  it('retries only the queries that failed', () => {
    const loaded = query({ data: [] });
    const failed = query({ isError: true });
    const slot = toSlot(meta, [loaded, failed], () => row);
    expect(slot.status).toBe('error');
    expect(slot.isRetrying).toBe(false);
    slot.retry?.();
    expect(failed.refetch).toHaveBeenCalledOnce();
    expect(loaded.refetch).not.toHaveBeenCalled();
  });

  it('shows an error over waiting, and when a retry is under way', () => {
    const slot = toSlot(meta, [query({ isError: true, isFetching: true })], () => row, true);
    expect(slot.status).toBe('error');
    expect(slot.isRetrying).toBe(true);
  });
});
