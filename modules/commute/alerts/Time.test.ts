import { describe, expect, it } from 'vitest';

import type { AlertTime } from '../../../common/types/alerts';
import { getDateString } from './Time';

const period = (start: string | null, end: string | null): AlertTime => ({
  start,
  end,
  current: false,
  upcoming: true,
});

describe('getDateString', () => {
  it('reads an alert with no end as ongoing since its start', () => {
    expect(getDateString([period('2026-11-10T05:00:00-05:00', null)])).toBe('Since Nov 10');
  });

  it('shows a single day for an overnight alert ending before 4 AM', () => {
    expect(getDateString([period('2026-11-15T21:00:00-05:00', '2026-11-16T02:00:00-05:00')])).toBe(
      'Nov 15'
    );
  });

  it('shows both months when the alert crosses into the next one', () => {
    expect(getDateString([period('2026-11-15T05:00:00-05:00', '2026-12-15T23:00:00-05:00')])).toBe(
      'Nov 15 - Dec 15'
    );
  });

  it('shows the end day alone within a month', () => {
    expect(
      getDateString([
        period('2026-11-15T05:00:00-05:00', '2026-11-15T23:00:00-05:00'),
        period('2026-11-20T05:00:00-05:00', '2026-11-20T23:00:00-05:00'),
      ])
    ).toBe('Nov 15 - 20');
  });

  it('shows years when the alert crosses into the next year', () => {
    expect(getDateString([period('2026-01-05T05:00:00-05:00', '2027-01-20T23:00:00-05:00')])).toBe(
      'Jan 5, 2026 - Jan 20, 2027'
    );
  });
});
