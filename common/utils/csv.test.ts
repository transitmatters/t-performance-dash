import { describe, expect, it } from 'vitest';
import { getImageFilename } from './csv';

describe('getImageFilename', () => {
  it('names a line chart after its line', () => {
    expect(
      getImageFilename({
        datasetName: 'slowtime',
        line: 'line-red',
        startDate: '2025-03-01',
        endDate: '2025-09-30',
      })
    ).toBe('line-red_slowtime_20250301-20250930.png');
  });

  it('names a systemwide chart "system" rather than "undefined"', () => {
    expect(
      getImageFilename({ datasetName: 'slowtime', startDate: '2025-01-01', endDate: '2025-06-30' })
    ).toBe('system_slowtime_20250101-20250630.png');
  });
});
