import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getServiceEmbedSnippet, getServicePageUrl } from './embed';

const query = { startDate: '2022-06-01', endDate: '2022-12-31', compare: 'peak', day: 'sunday' };
const srcOf = (snippet: string) => snippet.match(/src="([^"]+)"/)?.[1];

describe('service chart embeds', () => {
  beforeAll(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the dates and only the chart's own toggle", () => {
    expect(srcOf(getServiceEmbedSnippet('orange', 'delivered', query))).toBe(
      'https://dashboard.transitmatters.org/embed/orange/service/delivered/?startDate=2022-06-01&endDate=2022-12-31&compare=peak'
    );
    expect(srcOf(getServiceEmbedSnippet('orange', 'by-hour', query))).toBe(
      'https://dashboard.transitmatters.org/embed/orange/service/by-hour/?startDate=2022-06-01&endDate=2022-12-31&day=sunday'
    );
    expect(srcOf(getServiceEmbedSnippet('blue', 'round-trips', query))).toBe(
      'https://dashboard.transitmatters.org/embed/blue/service/round-trips/?startDate=2022-06-01&endDate=2022-12-31'
    );
  });

  it('titles the embed after the line and chart, and links back to its Service page', () => {
    expect(getServiceEmbedSnippet('red', 'hours', {})).toContain(
      'title="Red Line hours of service — TransitMatters"'
    );
    expect(getServicePageUrl('orange', 'delivered', query)).toBe(
      'https://dashboard.transitmatters.org/orange/service/?startDate=2022-06-01&endDate=2022-12-31&compare=peak'
    );
  });
});
