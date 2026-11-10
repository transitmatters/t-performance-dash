import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { DELAY_CAUSES, type LineDelays } from '../../common/types/delays';
import { REASON_BY_KEY, reasonLabel } from './constants/reasons';
import {
  axisStart,
  barAxisBounds,
  delayAggFor,
  delayAxisTicks,
  delayTimeAxis,
  formatDelay,
} from './format';
import {
  buildSeries,
  causeRows,
  medianPeriodTotal,
  minShareMinutes,
  periodTotals,
  toActualDelays,
  toMonthly,
  withinRange,
} from './reasonSeries';

const row = (overrides: Partial<LineDelays> = {}): LineDelays => ({
  date: '2026-10-14',
  line: 'line-red',
  total_delay_time: 0,
  ...(Object.fromEntries(DELAY_CAUSES.map((cause) => [cause, 0])) as Record<
    (typeof DELAY_CAUSES)[number],
    number
  >),
  ...overrides,
});

describe('toActualDelays', () => {
  it('swaps in the actual delay, per cause and in total', () => {
    const { rows, isActual } = toActualDelays([
      row({
        total_delay_time: 25,
        signal_problem: 25,
        delay_alert_minutes: 60,
        delay_alert_minutes_signal_problem: 60,
      }),
    ]);
    expect(isActual).toBe(true);
    expect(rows[0]).toMatchObject({
      total_delay_time: 60,
      stated_delay_time: 25,
      signal_problem: 60,
      other: 0,
    });
    expect(rows[0].stated_by_cause.signal_problem).toBe(25);
  });

  it('drops rows without the actual delay yet rather than mixing in the stated one', () => {
    const { rows } = toActualDelays([
      row({ delay_alert_minutes: 60, delay_alert_minutes_signal_problem: 60 }),
      row({ date: '2026-10-15', total_delay_time: 25, signal_problem: 25 }),
    ]);
    expect(rows.map((r) => r.date)).toEqual(['2026-10-14']);
  });

  it('keeps the stated delay when the line has no actual delay (Commuter Rail)', () => {
    const { rows, isActual } = toActualDelays([
      row({ line: 'line-commuter-rail', total_delay_time: 25, signal_problem: 25 }),
    ]);
    expect(isActual).toBe(false);
    expect(rows[0]).toMatchObject({
      total_delay_time: 25,
      stated_delay_time: 25,
      signal_problem: 25,
    });
  });
});

describe('causeRows', () => {
  it('ranks causes that occurred, biggest first, with their share of the total', () => {
    const rows = causeRows([
      row({ signal_problem: 30, door_problem: 10 }),
      row({ signal_problem: 30, other: 30 }),
    ]);
    expect(rows.map((r) => [r.key, r.total, r.share])).toEqual([
      ['signal_problem', 60, 0.6],
      ['other', 30, 0.3],
      ['door_problem', 10, 0.1],
    ]);
  });

  it('is empty when nothing was delayed', () => {
    expect(causeRows([row()])).toEqual([]);
  });

  it('calls a disabled vehicle a bus on bus routes', () => {
    const [top] = causeRows([row({ disabled_vehicle: 5 })], 'line-bus');
    expect(top.label).toBe('Disabled bus');
    expect(reasonLabel(REASON_BY_KEY.disabled_vehicle, 'line-red')).toBe('Disabled train');
  });
});

describe('buildSeries', () => {
  it('gives each occurring cause one value per period, in rank order', () => {
    const series = buildSeries([row({ fire: 5, flooding: 1 }), row({ fire: 2 })]);
    expect(series.map((s) => [s.id, s.values, s.total])).toEqual([
      ['fire', [5, 2], 7],
      ['flooding', [1, 0], 1],
    ]);
  });
});

describe('period totals', () => {
  it('sums every cause in each period', () => {
    expect(periodTotals([row({ fire: 5, other: 1 }), row()])).toEqual([6, 0]);
  });

  it('takes the median of periods with any delay, ignoring empty ones', () => {
    expect(medianPeriodTotal([0, 10, 30, 20, 0])).toBe(20);
    expect(medianPeriodTotal([0, 0])).toBe(0);
    expect(minShareMinutes([0, 10, 30, 20])).toBe(1);
  });
});

describe('formatDelay', () => {
  it('shows hours and minutes, never seconds', () => {
    expect(formatDelay(38)).toBe('38m');
    expect(formatDelay(52.25)).toBe('52m');
    expect(formatDelay(120)).toBe('2h');
    expect(formatDelay(34946)).toBe('582h 26m');
    expect(formatDelay(-249)).toBe('4h 09m');
  });

  it('puts axis ticks on round times', () => {
    expect(delayAxisTicks(1440).stepSize).toBe(360);
    expect(delayAxisTicks(250).stepSize).toBe(60);
    expect(delayAxisTicks(40).stepSize).toBe(15);
  });
});

describe('withinRange', () => {
  it('keeps periods inside the dates, inclusive', () => {
    const data = ['2026-10-01', '2026-10-05', '2026-10-09'].map((date) => row({ date }));
    expect(withinRange(data, '2026-10-05', '2026-10-09').map((r) => r.date)).toEqual([
      '2026-10-05',
      '2026-10-09',
    ]);
  });
});

describe('toMonthly', () => {
  // Mondays from Jan 26 to Feb 23, 2026: all of February, six days of January, one of March
  const weeks = (overrides: Partial<LineDelays>) =>
    ['2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23'].map((date) =>
      row({ date, ...overrides })
    );

  it('splits weeks across months by day and keeps only fully covered months', () => {
    const { rows } = toActualDelays(
      weeks({
        total_delay_time: 14,
        signal_problem: 14,
        delay_alert_minutes: 70,
        delay_alert_minutes_signal_problem: 70,
      })
    );
    const months = toMonthly(rows);
    expect(months.map((month) => month.date)).toEqual(['2026-02-01']);
    // 1/7 of the first week, three whole weeks, 6/7 of the last
    expect(months[0].total_delay_time).toBeCloseTo(280);
    expect(months[0].signal_problem).toBeCloseTo(280);
    expect(months[0].delay_alert_minutes).toBeCloseTo(280);
    expect(months[0].stated_delay_time).toBeCloseTo(56);
    expect(months[0].stated_by_cause.signal_problem).toBeCloseTo(56);
    expect(months[0].line).toBe('line-red');
  });

  it('leaves fields no week has unset', () => {
    const { rows } = toActualDelays(weeks({ total_delay_time: 7 }));
    const [month] = toMonthly(rows);
    expect(month.total_delay_time).toBeCloseTo(28);
    expect(month.delay_alert_minutes).toBeUndefined();
  });

  it('drops a month with a missing week', () => {
    const { rows } = toActualDelays(weeks({}).filter((week) => week.date !== '2026-02-09'));
    expect(toMonthly(rows)).toEqual([]);
  });
});

describe('long range axes', () => {
  it('picks days, weeks, then months', () => {
    expect(delayAggFor('2026-08-01', '2026-10-01')).toBe('daily');
    expect(delayAggFor('2025-10-01', '2026-10-01')).toBe('weekly');
    expect(delayAggFor('2016-01-01', '2026-10-01')).toBe('monthly');
    expect(delayTimeAxis('monthly').time.unit).toBe('year');
    expect(delayTimeAxis('weekly').time.unit).toBe('month');
  });

  it('starts the axis at the first row when data begins after the selected start', () => {
    expect(axisStart([row({ date: '2020-01-01' })], '2016-01-01')).toBe('2020-01-01');
    expect(axisStart([row({ date: '2025-12-29' })], '2026-01-01')).toBe('2026-01-01');
    expect(axisStart([], '2016-01-01')).toBe('2016-01-01');
  });

  it('pads bars by half a period and ends monthly bars at the last month', () => {
    const months = [row({ date: '2020-01-01' }), row({ date: '2026-09-01' })];
    const { min, max } = barAxisBounds(months, '2016-01-01', '2026-11-09', 'monthly');
    expect(dayjs(min).format('YYYY-MM-DD')).toBe('2019-12-17');
    expect(dayjs(max).format('YYYY-MM-DD')).toBe('2026-09-16');
    const daily = barAxisBounds([], '2026-10-01', '2026-10-31', 'daily');
    expect(dayjs(daily.max).diff('2026-10-31', 'hour')).toBe(12);
  });
});
