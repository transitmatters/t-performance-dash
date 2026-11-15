import { describe, expect, it } from 'vitest';
import { linePathToKeyMap } from '../utils/router';
import type { LinePath } from '../types/lines';
import { ALL_PAGES, PAGES } from './pages';
import type { LinePageKey } from './staticRoutes';
import { EMBED_PATHS, LINE_PAGE_LINES, STATIC_PATHS } from './staticRoutes';

const PAGE_FOR_ROUTE: Record<LinePageKey, PAGES> = {
  '': PAGES.overview,
  delays: PAGES.delays,
  fleet: PAGES.fleet,
  leaderboard: PAGES.leaderboard,
  predictions: PAGES.predictions,
  reliability: PAGES.reliability,
  ridership: PAGES.ridership,
  service: PAGES.service,
  slowzones: PAGES.slowzones,
  speed: PAGES.speed,
  speedmap: PAGES.speedmap,
  'trips/multi': PAGES.multiTrips,
  'trips/single': PAGES.singleTrips,
};

describe('LINE_PAGE_LINES', () => {
  // A route without the page's line renders an empty page; a page without the route 404s.
  it.each(Object.entries(PAGE_FOR_ROUTE))(
    '/$line/%s exists for the lines its page shows',
    (route, page) => {
      const routeLines = LINE_PAGE_LINES[route as LinePageKey].map(
        (line) => linePathToKeyMap[line as LinePath]
      );
      expect([...routeLines].sort()).toEqual([...ALL_PAGES[page].lines].sort());
    }
  );
});

describe('EMBED_PATHS', () => {
  it('covers every rail line and the systemwide slow zone chart', () => {
    expect(EMBED_PATHS.filter((path) => path.endsWith('/slowzones/'))).toEqual([
      '/embed/red/slowzones/',
      '/embed/orange/slowzones/',
      '/embed/green/slowzones/',
      '/embed/blue/slowzones/',
      '/embed/mattapan/slowzones/',
      '/embed/system/slowzones/',
    ]);
  });

  it('covers the Service page charts for rapid transit, and hours of service where it is shown', () => {
    const service = EMBED_PATHS.filter((path) => path.includes('/service/'));
    expect(service).toHaveLength(18);
    expect(service).toContain('/embed/mattapan/service/delivered/');
    expect(service).toContain('/embed/green/service/by-hour/');
    expect(service).toContain('/embed/orange/service/hours/');
    expect(service).not.toContain('/embed/green/service/hours/');
    expect(service).not.toContain('/embed/commuter-rail/service/round-trips/');
  });

  it('covers each single-day trip chart only for the modes whose trip page shows it', () => {
    const trips = EMBED_PATHS.filter((path) => path.includes('/trips/single/'));
    expect(trips).toHaveLength(28);
    expect(trips).toContain('/embed/bus/trips/single/traveltimes/');
    expect(trips).toContain('/embed/commuter-rail/trips/single/dwells/');
    expect(trips).toContain('/embed/ferry/trips/single/headway-distribution/');
    expect(trips).not.toContain('/embed/bus/trips/single/dwells/');
    expect(trips).not.toContain('/embed/commuter-rail/trips/single/headway-distribution/');
  });

  it('covers each Delays chart for every line with a Delays page', () => {
    const delays = EMBED_PATHS.filter((path) => path.includes('/delays/'));
    expect(delays).toHaveLength(21);
    expect(delays).toContain('/embed/green/delays/breakdown/');
    expect(delays).toContain('/embed/bus/delays/total/');
    expect(delays).toContain('/embed/commuter-rail/delays/causes/');
    expect(delays).not.toContain('/embed/ferry/delays/total/');
  });

  it('covers each multi-day trip chart only for the modes whose trip page shows it', () => {
    const trips = EMBED_PATHS.filter((path) => path.includes('/trips/multi/'));
    expect(trips).toHaveLength(35);
    expect(trips).toContain('/embed/red/trips/multi/speeds/');
    expect(trips).toContain('/embed/ferry/trips/multi/traveltimes-by-hour/');
    expect(trips).toContain('/embed/commuter-rail/trips/multi/dwells/');
    expect(trips).not.toContain('/embed/bus/trips/multi/speeds/');
    expect(trips).not.toContain('/embed/bus/trips/multi/dwells/');
  });

  it('stays out of STATIC_PATHS, which drives the link-preview cards', () => {
    expect(EMBED_PATHS.filter((path) => STATIC_PATHS.includes(path))).toEqual([]);
  });
});
