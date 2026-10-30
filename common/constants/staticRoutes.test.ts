import { describe, expect, it } from 'vitest';
import { EMBED_PATHS, STATIC_PATHS } from './staticRoutes';

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

  it('covers each single-day trip chart only for the modes whose trip page shows it', () => {
    const trips = EMBED_PATHS.filter((path) => path.includes('/trips/single/'));
    expect(trips).toHaveLength(28);
    expect(trips).toContain('/embed/bus/trips/single/traveltimes/');
    expect(trips).toContain('/embed/commuter-rail/trips/single/dwells/');
    expect(trips).toContain('/embed/ferry/trips/single/headway-distribution/');
    expect(trips).not.toContain('/embed/bus/trips/single/dwells/');
    expect(trips).not.toContain('/embed/commuter-rail/trips/single/headway-distribution/');
  });

  it('stays out of STATIC_PATHS, which drives the link-preview cards', () => {
    expect(EMBED_PATHS.filter((path) => STATIC_PATHS.includes(path))).toEqual([]);
  });
});
