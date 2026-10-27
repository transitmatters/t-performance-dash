import { describe, expect, it } from 'vitest';
import { getDatePickerBounds } from '../constants/dates';
import type { Tab } from '../types/router';
import { getNoDataReason, getPartialCoverageGaps } from './dataCoverage';

const TODAY = '2026-10-20';
type Context = Omit<Parameters<typeof getNoDataReason>[0], 'tab'>;
const ferry = (context: Context) => getNoDataReason({ tab: 'Ferry', today: TODAY, ...context });

describe('getNoDataReason', () => {
  it('explains the ferry gap for a day inside it and jumps past it', () => {
    const reason = ferry({ date: '2026-06-10' });
    expect(reason.title).toBe('No ferry data for this day');
    expect(reason.detail).toContain('Mar 31, 2026');
    expect(reason.jumpTo).toEqual({ date: '2026-10-02' });
    expect(reason.jumpLabel).toBe('Show Oct 2, 2026');
  });

  it('keeps the range length when jumping past the gap, capped at today', () => {
    expect(ferry({ startDate: '2026-05-01', endDate: '2026-05-08' }).jumpTo).toEqual({
      startDate: '2026-10-02',
      endDate: '2026-10-09',
    });
    expect(ferry({ startDate: '2026-04-01', endDate: '2026-10-01' }).jumpTo).toEqual({
      startDate: '2026-10-02',
      endDate: TODAY,
    });
  });

  it('sends travel times past the longer arrivals gap', () => {
    const reason = ferry({ date: '2026-06-10', metric: 'traveltimes' });
    expect(reason.title).toBe('No ferry travel times for this day');
    expect(reason.jumpTo).toEqual({ date: '2026-10-12' });
    expect(ferry({ date: '2026-10-05', metric: 'traveltimes' }).title).toBe(
      'No ferry travel times for this day'
    );
    expect(ferry({ date: '2026-10-05', metric: 'headways' }).title).toBe('No ferry trips recorded');
  });

  it('treats the gap edges as covered by the archive and by live recording', () => {
    expect(ferry({ date: '2026-03-31' }).title).toBe('No ferry trips recorded');
    expect(ferry({ date: '2026-04-01' }).title).toBe('No ferry data for this day');
    expect(ferry({ date: '2026-10-01' }).title).toBe('No ferry data for this day');
    expect(ferry({ date: '2026-10-02' }).title).toBe('No ferry trips recorded');
  });

  it('ignores the trip-data gap for line-wide metrics', () => {
    const reason = ferry({ startDate: '2026-05-01', endDate: '2026-06-01', isLineMetric: true });
    expect(reason.title).toBe('No data available');
    expect(reason.jumpTo).toBeUndefined();
  });

  it('says when the filter, not the query, emptied the chart', () => {
    expect(ferry({ date: '2026-06-10', filtered: true }).title).toBe('Nothing matches this filter');
  });

  it("offers yesterday when today's data hasn't arrived", () => {
    const reason = getNoDataReason({ tab: 'Subway', date: TODAY, today: TODAY });
    expect(reason.title).toBe('No trips recorded yet today');
    expect(reason.jumpTo).toEqual({ date: '2026-10-19' });
  });

  it('falls back to mode-specific copy', () => {
    expect(ferry({ date: '2025-07-15' }).detail).toContain('seasonally');
    expect(getNoDataReason({ tab: 'Bus', date: '2025-07-15', today: TODAY }).title).toBe(
      'No bus trips recorded'
    );
    expect(getNoDataReason({ tab: 'Subway', date: '2025-07-15', today: TODAY })).toEqual({
      title: 'No data available',
      detail: 'Try another station pair or date range.',
    });
  });
});

describe('getPartialCoverageGaps', () => {
  const labels = (dates: Parameters<typeof getPartialCoverageGaps>[1], tab: Tab = 'Ferry') =>
    getPartialCoverageGaps(tab, dates).map((gap) => gap.label);

  it('only reports gaps that cut into part of the range', () => {
    expect(labels({ startDate: '2026-01-01', endDate: '2026-10-15' })).toEqual([
      'Ferry travel times',
      'Ferry data',
    ]);
    expect(labels({ startDate: '2026-10-05', endDate: '2026-10-15' })).toEqual([
      'Ferry travel times',
    ]);
    expect(labels({ startDate: '2026-05-01', endDate: '2026-06-01' })).toEqual([]);
    expect(labels({ date: '2026-06-10' })).toEqual([]);
    expect(labels({ startDate: '2026-01-01', endDate: '2026-10-15' }, 'Bus')).toEqual([]);
  });
});

describe('ferry trip date bounds', () => {
  it('starts routes with no archived history at live recording', () => {
    expect(getDatePickerBounds('Ferry', 'singleTrips', 'Boat-F2H').minDate).toBe('2026-10-02');
    expect(getDatePickerBounds('Ferry', 'multiTrips', 'Boat-F10').minDate).toBe('2026-10-02');
    expect(getDatePickerBounds('Ferry', 'singleTrips', 'Boat-F4').minDate).toBe('2018-11-01');
    expect(getDatePickerBounds('Ferry', 'ridership', 'Boat-F2H').minDate).toBe('2018-11-01');
  });
});
