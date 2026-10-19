import { describe, expect, it } from 'vitest';
import { splitDateRange } from './dateChunks';

describe('splitDateRange', () => {
  it('leaves ranges of a year or less as one chunk', () => {
    expect(splitDateRange('2026-10-11', '2026-10-18')).toEqual([
      { startDate: '2026-10-11', endDate: '2026-10-18' },
    ]);
    expect(splitDateRange('2025-10-18', '2026-10-18')).toEqual([
      { startDate: '2025-10-18', endDate: '2026-10-18' },
    ]);
  });

  it('splits on Jan 1, clipping the edges, newest first', () => {
    expect(splitDateRange('2022-03-15', '2026-10-18')).toEqual([
      { startDate: '2026-01-01', endDate: '2026-10-18' },
      { startDate: '2025-01-01', endDate: '2025-12-31' },
      { startDate: '2024-01-01', endDate: '2024-12-31' },
      { startDate: '2023-01-01', endDate: '2023-12-31' },
      { startDate: '2022-03-15', endDate: '2022-12-31' },
    ]);
  });

  it('keeps whole calendar years whole', () => {
    expect(splitDateRange('2023-01-01', '2024-12-31')).toEqual([
      { startDate: '2024-01-01', endDate: '2024-12-31' },
      { startDate: '2023-01-01', endDate: '2023-12-31' },
    ]);
  });

  it('allows single-day edge chunks', () => {
    expect(splitDateRange('2023-12-31', '2025-01-01')).toEqual([
      { startDate: '2025-01-01', endDate: '2025-01-01' },
      { startDate: '2024-01-01', endDate: '2024-12-31' },
      { startDate: '2023-12-31', endDate: '2023-12-31' },
    ]);
  });

  it('aligns smaller chunks to the same calendar grid', () => {
    expect(splitDateRange('2024-09-10', '2025-08-01', 6)).toEqual([
      { startDate: '2025-07-01', endDate: '2025-08-01' },
      { startDate: '2025-01-01', endDate: '2025-06-30' },
      { startDate: '2024-09-10', endDate: '2024-12-31' },
    ]);
  });
});
