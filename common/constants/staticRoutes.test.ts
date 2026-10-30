import { describe, expect, it } from 'vitest';
import { EMBED_PATHS, STATIC_PATHS } from './staticRoutes';

describe('EMBED_PATHS', () => {
  it('covers every rail line and the systemwide chart', () => {
    expect(EMBED_PATHS).toEqual([
      '/embed/red/slowzones/',
      '/embed/orange/slowzones/',
      '/embed/green/slowzones/',
      '/embed/blue/slowzones/',
      '/embed/mattapan/slowzones/',
      '/embed/system/slowzones/',
    ]);
  });

  it('stays out of STATIC_PATHS, which drives the link-preview cards', () => {
    expect(EMBED_PATHS.filter((path) => STATIC_PATHS.includes(path))).toEqual([]);
  });
});
