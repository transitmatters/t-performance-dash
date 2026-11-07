import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getServiceDeliveredEmbedSnippet, getServicePageUrl } from './embed';

const dates = { startDate: '2022-06-01', endDate: '2022-12-31' };

describe('service delivered embed', () => {
  beforeAll(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the dates, and the comparison only when it is the historical maximum', () => {
    expect(
      getServiceDeliveredEmbedSnippet('orange', { ...dates, comparison: 'scheduled' })
    ).toContain(
      'src="https://dashboard.transitmatters.org/embed/orange/service/delivered/?startDate=2022-06-01&endDate=2022-12-31"'
    );
    expect(getServiceDeliveredEmbedSnippet('orange', { ...dates, comparison: 'peak' })).toContain(
      'src="https://dashboard.transitmatters.org/embed/orange/service/delivered/?startDate=2022-06-01&endDate=2022-12-31&compare=peak"'
    );
  });

  it('titles the embed after the line and links back to its Service page', () => {
    expect(getServiceDeliveredEmbedSnippet('red', { comparison: 'scheduled' })).toContain(
      'title="Red Line service delivered — TransitMatters"'
    );
    expect(getServicePageUrl('orange', { ...dates, comparison: 'peak' })).toBe(
      'https://dashboard.transitmatters.org/orange/service/?startDate=2022-06-01&endDate=2022-12-31&compare=peak'
    );
  });
});
