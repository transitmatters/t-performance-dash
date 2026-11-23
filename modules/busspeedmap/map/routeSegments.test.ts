import { describe, expect, it } from 'vitest';
import type { PMTiles } from 'pmtiles';
import { completeZoom } from './routeSegments';

const archiveWith = (metadata: object) => ({ getMetadata: async () => metadata }) as PMTiles;

describe('completeZoom', () => {
  it('is the zoom after the last one tippecanoe dropped features from', async () => {
    // A month's band archive, 2026-11: thinned at zooms 4-11.
    const strategies = [
      {},
      {},
      {},
      {},
      ...Array(8).fill({ dropped_as_needed: 1 }),
      {},
      {},
      {},
      {},
      {},
    ];
    expect(await completeZoom(archiveWith({ strategies }))).toBe(12);
  });

  it('is undefined for an archive that kept every feature', async () => {
    expect(await completeZoom(archiveWith({ strategies: [{}, {}, {}] }))).toBeUndefined();
    expect(await completeZoom(archiveWith({}))).toBeUndefined();
  });
});
