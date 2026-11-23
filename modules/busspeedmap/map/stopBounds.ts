import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { LngLatBounds } from 'maplibre-gl';
import type { PMTiles } from 'pmtiles';
import { BUS_STOPS_SOURCE_LAYER, NETWORK_BOUNDS } from '../constants';
import { isBusStopProperties } from './featureProperties';

const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
};

/** Every tile at zoom `z` that touches the box, as [x, y]. */
export const tilesCovering = (
  [west, south, east, north]: [number, number, number, number],
  z: number
): [number, number][] => {
  const tiles: [number, number][] = [];
  for (let x = tileX(west, z); x <= tileX(east, z); x++) {
    for (let y = tileY(north, z); y <= tileY(south, z); y++) tiles.push([x, y]);
  }
  return tiles;
};

/**
 * Where a route's stops are, read straight out of the stops archive: all of them, or only those
 * with these names. The map can't query them itself from the network view: bus stops only start
 * at about zoom 11, and below 12 a band archive's tiles keep only some of each route's segments,
 * so there may be little or nothing on the map to fit to. A name can match the stop across the
 * street as well, which only widens the box by a few metres.
 *
 * The archive lists the routes at each stop as of MBTA's current feed, so a retired route has
 * none. `fallbackStopIds` are found by stop_id instead when no stop lists any of `routeIds`.
 */
export const findStopBounds = async (
  archive: PMTiles,
  routeIds: string[],
  { stopNames, fallbackStopIds }: { stopNames?: string[]; fallbackStopIds?: string[] } = {}
): Promise<LngLatBounds | undefined> => {
  const { minZoom, maxZoom } = await archive.getHeader();
  const fallback = new Set(fallbackStopIds);

  // The archive's metadata gives bus stops the same minimum zoom as the stations, but they only
  // appear a few zooms later. Every stop appears at once, so the first zoom with any is complete,
  // and the zooms below it cover the network in a handful of tiles each.
  for (let z = minZoom; z <= maxZoom; z++) {
    const onRoute = new LngLatBounds();
    const byId = new LngLatBounds();
    let hasStops = false;
    for (const [x, y] of tilesCovering(NETWORK_BOUNDS, z)) {
      const tile = await archive.getZxy(z, x, y);
      const layer =
        tile &&
        new VectorTile(new PbfReader(new Uint8Array(tile.data))).layers[BUS_STOPS_SOURCE_LAYER];
      if (!layer) continue;
      hasStops ||= layer.length > 0;
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        const properties: unknown = feature.properties;
        if (!isBusStopProperties(properties)) continue;
        const { stop_id, stop_name, routes } = properties;
        if (stopNames && !stopNames.includes(stop_name)) continue;
        const bounds = routes.split(',').some((id) => routeIds.includes(id))
          ? onRoute
          : fallback.has(stop_id)
            ? byId
            : undefined;
        const { geometry } = feature.toGeoJSON(x, y, z);
        if (bounds && geometry.type === 'Point') {
          const [longitude, latitude] = geometry.coordinates;
          bounds.extend([longitude, latitude]);
        }
      }
    }
    if (!hasStops) continue;
    if (!onRoute.isEmpty()) return onRoute;
    return byId.isEmpty() ? undefined : byId;
  }
  return undefined;
};
