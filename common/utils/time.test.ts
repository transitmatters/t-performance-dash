import { describe, expect, it } from 'vitest';

import {
  formatMinutesTick,
  getClockFormattedTimeString,
  getFormattedTimeString,
  getTimeUnit,
} from './time';

describe('getFormattedTimeString', () => {
  it('shows seconds under 100 s', () => {
    expect(getFormattedTimeString(42)).toBe('42s');
    expect(getFormattedTimeString(-42)).toBe('42s');
  });

  it('shows minutes and padded seconds under an hour', () => {
    expect(getFormattedTimeString(125)).toBe('2m 05s');
    expect(getFormattedTimeString(3599)).toBe('59m 59s');
  });

  it('shows hours and padded minutes from an hour', () => {
    expect(getFormattedTimeString(3600)).toBe('1h 00m');
    expect(getFormattedTimeString(90, 'minutes')).toBe('1h 30m');
  });

  it('keeps counting hours past a day', () => {
    expect(getFormattedTimeString(86_400)).toBe('24h 00m');
    expect(getFormattedTimeString(1500, 'minutes')).toBe('25h 00m');
  });

  it('does not round the hours up', () => {
    expect(getFormattedTimeString(86_400 + 3599)).toBe('24h 59m');
    expect(getFormattedTimeString(2 * 86_400 + 1800)).toBe('48h 30m');
  });
});

describe('getTimeUnit', () => {
  it('picks the unit by size', () => {
    expect(getTimeUnit(99)).toBe('sec');
    expect(getTimeUnit(-100)).toBe('min');
    expect(getTimeUnit(3600)).toBe('hrs');
  });
});

describe('getClockFormattedTimeString', () => {
  it('formats seconds after midnight as a clock time', () => {
    expect(getClockFormattedTimeString(5 * 3600 + 30 * 60)).toBe('5:30');
    expect(getClockFormattedTimeString(17 * 3600 + 5 * 60 + 9, { showSeconds: true })).toBe(
      '17:05:09'
    );
  });

  it('can leave the hours off for a duration', () => {
    expect(getClockFormattedTimeString(95, { showHours: false, showSeconds: true })).toBe('1:35');
    expect(getClockFormattedTimeString(3700, { showHours: false, showSeconds: true })).toBe(
      '61:40'
    );
  });

  it('uses a 12-hour clock with AM and PM', () => {
    expect(getClockFormattedTimeString(9 * 3600, { use12Hour: true })).toBe('9:00 AM');
    expect(getClockFormattedTimeString(12 * 3600 + 1800, { use12Hour: true })).toBe('12:30 PM');
    expect(getClockFormattedTimeString(13 * 3600, { use12Hour: true })).toBe('1:00 PM');
    // Service past midnight runs on as hour 24 and up.
    expect(getClockFormattedTimeString(24 * 3600 + 1800, { use12Hour: true })).toBe('12:30 AM');
  });

  it('shows the half hour after midnight as 12:30 AM', () => {
    expect(getClockFormattedTimeString(1800, { use12Hour: true })).toBe('12:30 AM');
  });
});

describe('formatMinutesTick', () => {
  it('formats every tick as minutes and seconds', () => {
    expect(formatMinutesTick(2)).toBe('2:00');
    expect(formatMinutesTick(1.6)).toBe('1:36');
    expect(formatMinutesTick(0.5)).toBe('0:30');
    expect(formatMinutesTick(75)).toBe('75:00');
  });
});
