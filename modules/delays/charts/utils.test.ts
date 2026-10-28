import { describe, expect, it } from 'vitest';
import { DELAY_CAUSES, type LineDelays } from '../../../common/types/delays';
import { toDisplayedDelays } from './utils';

const row = (overrides: Partial<LineDelays> = {}): LineDelays => ({
  date: '2026-10-14',
  line: 'line-red',
  total_delay_time: 25,
  ...(Object.fromEntries(DELAY_CAUSES.map((cause) => [cause, 0])) as Record<
    (typeof DELAY_CAUSES)[number],
    number
  >),
  signal_problem: 25,
  ...overrides,
});

describe('toDisplayedDelays', () => {
  it('uses the actual delay, keeping the stated delay to compare against', () => {
    const { delays, isActual } = toDisplayedDelays([
      row({ delay_alert_minutes: 304, delay_alert_minutes_signal_problem: 304 }),
    ]);
    expect(isActual).toBe(true);
    expect(delays[0]).toMatchObject({
      total_delay_time: 304,
      stated_delay_time: 25,
      signal_problem: 304,
      other: 0,
    });
  });

  it('leaves a gap for a row without the actual delay yet, rather than mixing in the stated one', () => {
    const { delays } = toDisplayedDelays([
      row({ delay_alert_minutes: 304, delay_alert_minutes_signal_problem: 304 }),
      row({ date: '2026-10-15' }),
    ]);
    expect(delays[1].total_delay_time).toBeNull();
    expect(delays[1].signal_problem).toBe(0);
    expect(delays[1].stated_delay_time).toBe(25);
  });

  it('keeps the stated delay when the line has no actual delay (Commuter Rail)', () => {
    const { delays, isActual } = toDisplayedDelays([row({ line: 'line-commuter-rail' })]);
    expect(isActual).toBe(false);
    expect(delays[0]).toMatchObject({
      total_delay_time: 25,
      stated_delay_time: 25,
      signal_problem: 25,
    });
  });
});
