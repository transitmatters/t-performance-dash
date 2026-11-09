import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { RidershipCount } from '../../../common/types/dataPoints';
import { getWeekStart } from '../../../common/utils/date';
import { WINDOW_START, YEAR_OVER_YEAR_START, buildRidershipRow } from './scorecardUtils';

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
