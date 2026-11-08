import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Route } from '../../common/types/router';
import { getDelaysEmbedSnippet, getDelaysPageUrl } from './embed';

const green = {
  line: 'line-green',
  linePath: 'green',
  query: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    branch: 'C',
    dlView: 'share',
    focus: 'signal',
    ttDays: 'weekday',
  },
} as unknown as Route;

const srcOf = (snippet: string) => snippet.match(/src="([^"]+)"/)?.[1];

describe('delays embed snippets', () => {
  beforeAll(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the dates, branch and only the chart's own toggle", () => {
    expect(srcOf(getDelaysEmbedSnippet('breakdown', green))).toBe(
      'https://dashboard.transitmatters.org/embed/green/delays/breakdown/?startDate=2024-01-01&endDate=2024-12-31&branch=C&dlView=share'
    );
    expect(srcOf(getDelaysEmbedSnippet('total', green))).toBe(
      'https://dashboard.transitmatters.org/embed/green/delays/total/?startDate=2024-01-01&endDate=2024-12-31&branch=C&focus=signal'
    );
  });

  it('titles the embed after the route or branch', () => {
    expect(getDelaysEmbedSnippet('breakdown', green)).toContain(
      'title="Green Line C Branch delay time by cause — TransitMatters"'
    );
    const bus = { line: 'line-bus', linePath: 'bus', query: { busRoute: '1' } } as Route;
    expect(getDelaysEmbedSnippet('causes', bus)).toContain('title="Route 1 delay causes');
  });

  it('links back to the Delays page', () => {
    expect(getDelaysPageUrl('causes', green)).toBe(
      'https://dashboard.transitmatters.org/green/delays/?startDate=2024-01-01&endDate=2024-12-31&branch=C&focus=signal'
    );
  });
});
