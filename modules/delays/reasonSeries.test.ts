import { describe, expect, it } from 'vitest';
import { DELAY_CAUSES, type LineDelays } from '../../common/types/delays';
import { REASON_BY_KEY, reasonLabel } from './constants/reasons';
import { delayAxisTicks, formatDelay } from './format';
import {
  buildSeries,
  causeRows,
  medianPeriodTotal,
  minShareMinutes,
  periodTotals,
  toActualDelays,
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
