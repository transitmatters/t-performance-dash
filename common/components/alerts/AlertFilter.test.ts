import { describe, expect, it } from 'vitest';

import { findMatch } from './AlertFilter';

const alert = (text: string | null) => ({
  text,
  valid_from: '2026-11-05T08:05:00-05:00',
  valid_to: '2026-11-05T10:40:00-05:00',
});

describe('findMatch', () => {
  it('matches a known alert format', () => {
    expect(findMatch(alert('Delays of up to 15 minutes'))).toBe(true);
  });

  it('skips an alert with no text instead of throwing', () => {
    expect(findMatch(alert(null))).toBe(false);
  });
});
