import { describe, expect, it } from 'vitest';
import { DELAY_CAUSES } from '../../common/types/delays';
import type { DelayRow } from './reasonSeries';
import { coverRange, splitByWeek } from './range';
import { getDelayStats } from './utils';

const row = (date: string, minutes: number, overrides: Partial<DelayRow> = {}): DelayRow => {
  const causes = Object.fromEntries(DELAY_CAUSES.map((cause) => [cause, 0])) as Record<
    (typeof DELAY_CAUSES)[number],
    number
  >;
  return {
    date,
    line: 'line-red',
    ...causes,
    total_delay_time: minutes,
    signal_problem: minutes,
    stated_delay_time: minutes,
    stated_by_cause: { ...causes, signal_problem: minutes },
    ...overrides,
  };
};

const days = (from: string, to: string, minutes: number) => {
  const rows: DelayRow[] = [];
  for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`);) {
    rows.push(row(d.toISOString().slice(0, 10), minutes));
    d = new Date(d.getTime() + 86_400_000);
  }
  return rows;
};

describe('splitByWeek', () => {
  // 2026-06-03 is a Wednesday, 2026-09-08 a Tuesday, 2026-11-11 a Wednesday
  it('uses daily rows for the part weeks at either end of a past range', () => {
    expect(splitByWeek('2026-06-03', '2026-09-08', '2026-11-11')).toEqual({
      head: ['2026-06-03', '2026-06-07'],
      weeks: ['2026-06-08', '2026-09-06'],
      tail: ['2026-09-07', '2026-09-08'],
    });
  });

  it('needs no daily rows for a range of whole, finished weeks', () => {
    expect(splitByWeek('2026-06-08', '2026-09-13', '2026-11-11')).toEqual({
      weeks: ['2026-06-08', '2026-09-13'],
      head: undefined,
      tail: undefined,
    });
  });

  it('uses daily rows for the week in progress', () => {
    expect(splitByWeek('2026-06-08', '2026-11-11', '2026-11-11').tail).toEqual([
      '2026-11-09',
      '2026-11-11',
    ]);
  });

  it("uses daily rows for last week on a Monday, before the weekly table's rebuild", () => {
    expect(splitByWeek('2026-06-08', '2026-11-09', '2026-11-09').tail).toEqual([
      '2026-11-02',
      '2026-11-09',
    ]);
    // By Tuesday it has caught up
    expect(splitByWeek('2026-06-08', '2026-11-10', '2026-11-10').tail).toEqual([
      '2026-11-09',
      '2026-11-10',
    ]);
  });
});

describe('coverRange', () => {
  it('adds up to exactly the selected dates', () => {
    const split = splitByWeek('2026-06-03', '2026-09-08', '2026-11-11');
    // 10 minutes a day: whole weeks sum to 70, and the first and last weeks run past the range
    const weeks = days('2026-06-01', '2026-09-07', 0)
      .filter((_, i) => i % 7 === 0)
      .map((week) => row(week.date, 70));
    const daily = days('2026-06-01', '2026-09-13', 10);

    const rows = coverRange(split, weeks, daily);
    const total = rows.reduce((sum, r) => sum + r.total_delay_time, 0);
    const covered = rows.reduce((sum, r) => sum + r.days, 0);

    // June 3 to September 8: 98 days
    expect(covered).toBe(98);
    expect(total).toBe(980);
    expect(rows.map((r) => r.date)).toEqual([...rows.map((r) => r.date)].sort());
  });
});

describe('getDelayStats', () => {
  it('averages a part week by the days it covers', () => {
    // Three weeks at 70 minutes, then two days of the week in progress at 10 a day
    const split = splitByWeek('2026-10-19', '2026-11-10', '2026-11-10');
    const weeks = ['2026-10-19', '2026-10-26', '2026-11-02'].map((date) => row(date, 70));
    const stats = getDelayStats(
      coverRange(split, weeks, days('2026-11-09', '2026-11-10', 10)),
      'weekly'
    );

    expect(stats.totalDelay).toBe(230);
    expect(stats.avgDelay).toBeCloseTo(70);
    expect(stats.avgDelayDelta).toBeCloseTo(0);
  });

  it('gives the monthly view a month of average length', () => {
    const rows = days('2026-01-01', '2026-12-31', 10).map((r) => ({ ...r, days: 1 }));

    expect(getDelayStats(rows, 'monthly').avgDelay).toBeCloseTo(304.375);
  });

  it('matches the plain average of days in the daily view', () => {
    const rows = days('2026-11-01', '2026-11-05', 0).map((r, i) => ({
      ...r,
      total_delay_time: [10, 20, 30, 40, 50][i],
      days: 1,
    }));
    const stats = getDelayStats(rows, 'daily');

    expect(stats.avgDelay).toBe(30);
    // Leading half is the first two days (15 a day), trailing the last three (40 a day)
    expect(stats.avgDelayDelta).toBe(25);
  });
});
