import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Route } from '../../common/types/router';
import { getTripEmbedSnippet, getTripPageUrl } from './embed';

const route = {
  line: 'line-red',
  linePath: 'red',
  query: {
    from: 'place-pktrm',
    to: 'place-harsq',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    date: '2026-10-21',
    ttView: 'speeds',
    ttDays: 'weekday',
    hwDays: 'weekend',
  },
} as unknown as Route;

const srcOf = (snippet: string) => snippet.match(/src="([^"]+)"/)?.[1];

describe('trip embed snippets', () => {
  beforeAll(() => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("keeps a multi-day chart's dates and its own day filter, and drops the other cards' toggles", () => {
    expect(srcOf(getTripEmbedSnippet({ page: 'multi', chart: 'headways' }, route))).toBe(
      'https://dashboard.transitmatters.org/embed/red/trips/multi/headways/?from=place-pktrm&to=place-harsq&startDate=2026-09-01&endDate=2026-10-31&hwDays=weekend'
    );
    expect(srcOf(getTripEmbedSnippet({ page: 'multi', chart: 'speeds' }, route))).toBe(
      'https://dashboard.transitmatters.org/embed/red/trips/multi/speeds/?from=place-pktrm&to=place-harsq&startDate=2026-09-01&endDate=2026-10-31'
    );
  });

  it('keeps only the day on a single-day chart', () => {
    expect(srcOf(getTripEmbedSnippet({ page: 'single', chart: 'traveltimes' }, route))).toBe(
      'https://dashboard.transitmatters.org/embed/red/trips/single/traveltimes/?from=place-pktrm&to=place-harsq&date=2026-10-21'
    );
  });

  it('titles the embed after the route and chart', () => {
    const bus = { ...route, line: 'line-bus', linePath: 'bus', query: { busRoute: '1' } } as Route;
    expect(getTripEmbedSnippet({ page: 'multi', chart: 'traveltimes-by-hour' }, bus)).toContain(
      'title="Route 1 travel times by hour — TransitMatters"'
    );
  });

  it('links back to the trip page it came from', () => {
    expect(getTripPageUrl({ page: 'multi', chart: 'dwells' }, route)).toBe(
      'https://dashboard.transitmatters.org/red/trips/multi/?from=place-pktrm&to=place-harsq&startDate=2026-09-01&endDate=2026-10-31'
    );
  });
});
