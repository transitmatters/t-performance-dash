import { describe, expect, it } from 'vitest';
import { unfinishedDay } from './SameDayNotice';

describe('unfinishedDay', () => {
  it('flags today', () => {
    expect(unfinishedDay(['2026-11-20', undefined], '2026-11-20', '2026-11-20')).toBe('today');
    expect(unfinishedDay([undefined, '2026-11-20'], '2026-11-20', '2026-11-20')).toBe('today');
  });

  it('flags yesterday before 3 AM, while its service is still running', () => {
    expect(unfinishedDay(['2026-11-19', undefined], '2026-11-20', '2026-11-19')).toBe('yesterday');
    expect(unfinishedDay([undefined, '2026-11-19'], '2026-11-20', '2026-11-19')).toBe('yesterday');
  });

  it('leaves finished days alone', () => {
    expect(unfinishedDay(['2026-11-19', undefined], '2026-11-20', '2026-11-20')).toBeUndefined();
    expect(unfinishedDay(['2026-11-18', undefined], '2026-11-20', '2026-11-19')).toBeUndefined();
    expect(unfinishedDay([undefined, undefined], '2026-11-20', '2026-11-19')).toBeUndefined();
  });
});
