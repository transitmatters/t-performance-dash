import { VectorTile } from '@mapbox/vector-tile';
import { useQuery } from '@tanstack/react-query';
import { PbfReader } from 'pbf';
import type { Feature, FeatureCollection } from 'geojson';
import type { LngLatBounds } from 'maplibre-gl';
import type { PMTiles } from 'pmtiles';
import { PMTILES_SOURCE_LAYER } from '../constants';
import { sharedRouteKeys } from '../utils';
import { findStopBounds, tilesCovering } from './stopBounds';

export const EMPTY_ROUTE: FeatureCollection = { type: 'FeatureCollection', features: [] };

/**
 * The lowest zoom from which the archive holds every segment, or undefined if it never left any
 * out. tippecanoe lists what it dropped at each zoom in the metadata's `strategies`, indexed by
 * zoom; an empty entry means nothing was. A month's band archive is thinned below 12, a day's
 * below 9, and an all_day archive not at all.
 */
export const completeZoom = async (
  archive: Pick<PMTiles, 'getMetadata'>
): Promise<number | undefined> => {
  const metadata = await archive.getMetadata();
  const strategies: unknown[] | undefined =
    typeof metadata === 'object' &&
    metadata !== null &&
    'strategies' in metadata &&
    Array.isArray(metadata.strategies)
      ? metadata.strategies
      : undefined;
  const lastThinned = strategies?.findLastIndex(
    (strategy) =>
      typeof strategy === 'object' && strategy !== null && Object.keys(strategy).length > 0
  );
  return lastThinned === undefined || lastThinned === -1 ? undefined : lastThinned + 1;
};

/**
 * Every segment of these routes in the box, read from the archive at `zoom`. Below the archive's
 * complete zoom its tiles keep only some of each route's segments, often none of the band on show,
 * so the map draws a selected route from these instead. A segment crossing a tile edge comes back
 * once per tile, which only overlaps by the tile's few-pixel buffer.
 */
export const readRouteSegments = async (
  archive: PMTiles,
  zoom: number,
  bounds: LngLatBounds,
  routeKeys: string[]
): Promise<FeatureCollection> => {
  const [southWest, northEast] = bounds.toArray();
  const tiles = await Promise.all(
    tilesCovering([...southWest, ...northEast], zoom).map(async ([x, y]) => ({
      x,
      y,
      tile: await archive.getZxy(zoom, x, y),
    }))
  );
  const features: Feature[] = [];
  for (const { x, y, tile } of tiles) {
    const layer =
      tile && new VectorTile(new PbfReader(new Uint8Array(tile.data))).layers[PMTILES_SOURCE_LAYER];
    if (!layer) continue;
    for (let i = 0; i < layer.length; i++) {
      const feature = layer.feature(i);
      if (!routeKeys.includes(String(feature.properties.route_id))) continue;
      // Copied: the decoder's properties have no prototype, which maplibre can't send to its
      // worker.
      const { geometry, properties } = feature.toGeoJSON(x, y, zoom);
      features.push({ type: 'Feature', geometry, properties: { ...properties } });
    }
  }
  return { type: 'FeatureCollection', features };
};

interface UseRouteSegmentsOptions {
  archiveFor: (url: string) => PMTiles | undefined;
  pmtilesUrl: string;
  stopsKey?: string;
  routeIds?: string[];
  routeStopIds?: string[];
  zoom?: number;
}

/**
 * The selected route's segments, for the map to draw below its archive's complete zoom. Only read
 * while the map is down there, as it costs the route's tiles at that zoom: about 1-4MB unpacked for
 * one of a month's, mostly the downtown ones every route through it shares.
 */
export const useRouteSegments = ({
  archiveFor,
  pmtilesUrl,
  stopsKey,
  routeIds,
  routeStopIds,
  zoom,
}: UseRouteSegmentsOptions): { segments: FeatureCollection; belowZoom: number } | undefined => {
  const { data: fromZoom } = useQuery({
    queryKey: ['busSpeedCompleteZoom', pmtilesUrl],
    queryFn: async () => {
      const archive = archiveFor(pmtilesUrl);
      return (archive && (await completeZoom(archive))) ?? null;
    },
    staleTime: Infinity,
  });
  const { data: segments } = useQuery({
    queryKey: ['busRouteSegments', pmtilesUrl, stopsKey, routeIds, fromZoom],
    queryFn: async () => {
      const stops = stopsKey ? archiveFor(stopsKey) : undefined;
      const archive = archiveFor(pmtilesUrl);
      if (!stops || !archive || !routeIds || fromZoom == null) return EMPTY_ROUTE;
      const bounds = await findStopBounds(stops, routeIds, { fallbackStopIds: routeStopIds });
      if (!bounds) return EMPTY_ROUTE;
      return readRouteSegments(archive, fromZoom, bounds, [
        ...routeIds,
        ...sharedRouteKeys(routeIds),
      ]);
    },
    enabled: !!routeIds && !!stopsKey && fromZoom != null && zoom !== undefined && zoom < fromZoom,
    staleTime: Infinity,
  });
  return segments && fromZoom != null ? { segments, belowZoom: fromZoom } : undefined;
};
