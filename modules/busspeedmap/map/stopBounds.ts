import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { LngLatBounds } from 'maplibre-gl';
import type { PMTiles } from 'pmtiles';
import { BUS_STOPS_SOURCE_LAYER, NETWORK_BOUNDS } from '../constants';
import type { BusStopProperties } from '../types';

const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
};

/**
 * Where a route's stops with these names are, read straight out of the stops archive. The map
 * can't query them itself from the network view: bus stops only start at about zoom 11, and a
 * segment in a dense area like downtown is thinned out of the speed tiles below 12, so at the
 * network view there's nothing on the map to fly to. A name can match the stop across the street
 * as well, which only widens the box by a few metres.
 */
export const findStopBounds = async (
  archive: PMTiles,
  routeIds: string[],
  stopNames: string[]
): Promise<LngLatBounds | undefined> => {
  const { minZoom, maxZoom } = await archive.getHeader();
  const [west, south, east, north] = NETWORK_BOUNDS;

  // The archive's metadata gives bus stops the same minimum zoom as the stations, but they only
  // appear a few zooms later. Every stop appears at once, so the first zoom with any is complete,
  // and the zooms below it cover the network in a handful of tiles each.
  for (let z = minZoom; z <= maxZoom; z++) {
    const bounds = new LngLatBounds();
    let hasStops = false;
    for (let x = tileX(west, z); x <= tileX(east, z); x++) {
      for (let y = tileY(north, z); y <= tileY(south, z); y++) {
        const tile = await archive.getZxy(z, x, y);
        const layer =
          tile &&
          new VectorTile(new PbfReader(new Uint8Array(tile.data))).layers[BUS_STOPS_SOURCE_LAYER];
        if (!layer) continue;
        hasStops ||= layer.length > 0;
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i);
          const { stop_name, routes } = feature.properties as unknown as BusStopProperties;
          const onRoute = routes.split(',').some((id) => routeIds.includes(id));
          if (!onRoute || !stopNames.includes(stop_name)) continue;
          const { geometry } = feature.toGeoJSON(x, y, z);
          if (geometry.type === 'Point') bounds.extend(geometry.coordinates as [number, number]);
        }
      }
    }
    if (hasStops) return bounds.isEmpty() ? undefined : bounds;
  }
  return undefined;
};
