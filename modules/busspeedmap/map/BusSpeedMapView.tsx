import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addProtocol, LngLatBounds, setWorkerUrl } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import type {
  DataDrivenPropertyValueSpecification,
  FilterSpecification,
  MapGeoJSONFeature,
} from 'maplibre-gl';
import {
  BOSTON_CENTER,
  MAP_MAX_BOUNDS,
  MIN_TRAVERSALS,
  PMTILES_SOURCE_LAYER,
  SPEED_COLOR_STOPS,
} from '../constants';
import type { BusSpeedSegmentProperties, TimeBand } from '../types';

// Registered once at module scope, onto the shared maplibre-gl module. This file is only
// ever reached through BusSpeedMapDetails' `dynamic(..., { ssr: false })` import, so it
// never runs during the static export's Node prerender.
const protocol = new Protocol();
addProtocol('pmtiles', protocol.tile);

// maplibre-gl resolves its worker module at runtime via `new URL('./maplibre-gl-worker.mjs',
// import.meta.url)`, built from a template literal rather than a static path -- webpack's
// `new Worker(new URL(...))` bundling only recognises a literal, so it never bundles that
// file, and `import.meta.url` then points at whatever chunk webpack inlined maplibre-gl's
// code into instead of the real one. Left alone, the worker request 404s and the map never
// paints (basemap included) with no maplibre-level error, just a browser-level "module
// script" MIME-type error. `scripts/copy-maplibre-worker.js` vends fixed, unbundled copies
// into public/ on every install; this just points maplibre at them.
setWorkerUrl('/maplibre-gl-worker.mjs');

// CARTO's Positron. Free to use with attribution, and already the basemap TransitMatters
// uses in otp-app, so there is no per-load billing to worry about here.
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const SOURCE_ID = 'bus-speed-segments';
const HITBOX_LAYER_ID = 'bus-speed-hitbox';

const speedColor: DataDrivenPropertyValueSpecification<string> = [
  'interpolate',
  ['linear'],
  ['get', 'p50_speed_mph'],
  ...SPEED_COLOR_STOPS.flat(),
] as unknown as DataDrivenPropertyValueSpecification<string>;

/** Segments thicken with zoom so the network reads as a whole when zoomed out. */
const zoomWidth = (
  atLowZoom: number,
  atMidZoom: number,
  atHighZoom: number
): DataDrivenPropertyValueSpecification<number> =>
  [
    'interpolate',
    ['linear'],
    ['zoom'],
    9,
    atLowZoom,
    13,
    atMidZoom,
    16,
    atHighZoom,
  ] as unknown as DataDrivenPropertyValueSpecification<number>;

const lineWidth = zoomWidth(1.5, 3.5, 6);
const casingWidth = zoomWidth(3.5, 5.5, 8);

interface HoveredSegment {
  longitude: number;
  latitude: number;
  properties: BusSpeedSegmentProperties;
}

interface BusSpeedMapViewProps {
  pmtilesUrl: string;
  timeBand: TimeBand;
  routeFilter?: string;
  /** Called with the full set of route_ids discovered so far, whenever it grows. */
  onRouteIdsDiscovered?: (routeIds: string[]) => void;
}

export const BusSpeedMapView: React.FC<BusSpeedMapViewProps> = ({
  pmtilesUrl,
  timeBand,
  routeFilter,
  onRouteIdsDiscovered,
}) => {
  const [hovered, setHovered] = useState<HoveredSegment | undefined>();
  const mapRef = useRef<MapRef>(null);
  const knownRouteIds = useRef<Set<string>>(new Set());

  // A new date means a new tileset, so any routes discovered under the old one no longer
  // apply.
  useEffect(() => {
    knownRouteIds.current = new Set();
    onRouteIdsDiscovered?.([]);
    // Only on pmtilesUrl change: onRouteIdsDiscovered is a fresh setState callback every
    // render and must not retrigger this reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pmtilesUrl]);

  const filter = useMemo<FilterSpecification>(() => {
    const clauses: FilterSpecification[] = [
      ['>=', ['get', 'n_traversals'], MIN_TRAVERSALS],
      ['==', ['get', 'time_band'], timeBand],
    ];
    if (routeFilter) clauses.push(['==', ['get', 'route_id'], routeFilter]);
    return ['all', ...clauses] as unknown as FilterSpecification;
  }, [timeBand, routeFilter]);

  const onMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      setHovered(undefined);
      return;
    }
    setHovered({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      properties: feature.properties as unknown as BusSpeedSegmentProperties,
    });
  };

  // Vector tiles arrive tile-by-tile, so the full set of routes present in the file is only
  // knowable once everything currently in view has loaded — re-scanned on every idle (the
  // initial load and after each pan/zoom) so the route filter fills in as more of the
  // network comes into view, rather than needing a separate manifest from the ingest job.
  const onIdle = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.getSource(SOURCE_ID)) return;

    const features = map.querySourceFeatures(SOURCE_ID, { sourceLayer: PMTILES_SOURCE_LAYER });
    let grew = false;
    for (const feature of features) {
      const routeId = feature.properties?.route_id;
      if (typeof routeId === 'string' && !knownRouteIds.current.has(routeId)) {
        knownRouteIds.current.add(routeId);
        grew = true;
      }
    }
    if (grew) {
      onRouteIdsDiscovered?.(
        [...knownRouteIds.current].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
      );
    }
  }, [onRouteIdsDiscovered]);

  const isFirstRender = useRef(true);

  // Pans/zooms to the selected route on every change, and back out to the network overview
  // when the filter is cleared. Skipped on mount: the initial view is already correct, and
  // firing here too would flash a redundant animation to the same spot.
  useEffect(() => {
    // Flipped unconditionally on the very first invocation, before the map-readiness check
    // below -- the map instance isn't attached to the ref yet on initial mount, so gating
    // this on `map` being truthy would leave isFirstRender stuck true until whatever
    // routeFilter change happens to be the first one after the map finishes loading,
    // silently swallowing that pan/zoom instead of skipping only the true initial render.
    const skippingInitialRender = isFirstRender.current;
    isFirstRender.current = false;

    const map = mapRef.current?.getMap();
    if (!map || skippingInitialRender) return;

    if (!routeFilter) {
      map.easeTo({
        center: [BOSTON_CENTER.longitude, BOSTON_CENTER.latitude],
        zoom: BOSTON_CENTER.zoom,
        duration: 800,
      });
      return;
    }

    const routeFilterExpression: FilterSpecification = ['==', ['get', 'route_id'], routeFilter];

    const boundsOfLoadedRoute = (): LngLatBounds | undefined => {
      const features = map.querySourceFeatures(SOURCE_ID, {
        sourceLayer: PMTILES_SOURCE_LAYER,
        filter: routeFilterExpression,
      }) as MapGeoJSONFeature[];
      if (!features.length) return undefined;

      const bounds = new LngLatBounds();
      for (const feature of features) {
        if (feature.geometry.type !== 'LineString') continue;
        for (const position of feature.geometry.coordinates) {
          bounds.extend(position as [number, number]);
        }
      }
      return bounds.isEmpty() ? undefined : bounds;
    };

    let cancelled = false;
    // Bounded to one retry: a route's tiles may not be loaded yet if the user was panned
    // somewhere else, so jump (no animation) to the low zoom that covers the whole network --
    // per PMTILES_SOURCE_LAYER's zoom range, that's guaranteed to have every route's geometry
    // -- and try again once those tiles are in. If a route still has nothing after that, its
    // segments are missing at all zooms and there's nothing sensible left to fly to.
    const attempt = (isRetry: boolean) => {
      if (cancelled) return;
      const bounds = boundsOfLoadedRoute();
      if (bounds) {
        map.fitBounds(bounds, { padding: 48, duration: 800, maxZoom: 15 });
      } else if (!isRetry) {
        map.once('idle', () => attempt(true));
        map.jumpTo({ center: [BOSTON_CENTER.longitude, BOSTON_CENTER.latitude], zoom: 8 });
      }
    };
    attempt(false);

    return () => {
      cancelled = true;
    };
  }, [routeFilter]);

  return (
    <Map
      ref={mapRef}
      initialViewState={BOSTON_CENTER}
      maxBounds={MAP_MAX_BOUNDS}
      mapStyle={BASEMAP_STYLE}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={[HITBOX_LAYER_ID]}
      cursor={hovered ? 'pointer' : 'grab'}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHovered(undefined)}
      onIdle={onIdle}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id={SOURCE_ID} type="vector" url={`pmtiles://${pmtilesUrl}`}>
        {/* A dark casing under the ramp. Positron is nearly white, so the pale middle of
            the speed scale would otherwise disappear into the basemap. */}
        <Layer
          id="bus-speed-casing"
          type="line"
          source-layer={PMTILES_SOURCE_LAYER}
          filter={filter}
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{ 'line-color': 'rgba(0, 0, 0, 0.35)', 'line-width': casingWidth }}
        />
        <Layer
          id="bus-speed-lines"
          type="line"
          source-layer={PMTILES_SOURCE_LAYER}
          filter={filter}
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{ 'line-color': speedColor, 'line-width': lineWidth }}
        />
        {/* Invisible and deliberately fat: the drawn segments are a few pixels wide, which
            is far too fine a target to hover reliably. */}
        <Layer
          id={HITBOX_LAYER_ID}
          type="line"
          source-layer={PMTILES_SOURCE_LAYER}
          filter={filter}
          paint={{ 'line-color': '#000000', 'line-opacity': 0, 'line-width': 14 }}
        />
      </Source>

      {hovered && (
        <Popup
          longitude={hovered.longitude}
          latitude={hovered.latitude}
          closeButton={false}
          closeOnClick={false}
          maxWidth="280px"
        >
          <div className="text-xs text-stone-900">
            <p className="font-semibold">
              Route {hovered.properties.route_id}
              <span className="font-normal text-stone-600">
                {' '}
                · {hovered.properties.direction_id === 1 ? 'Inbound' : 'Outbound'}
              </span>
            </p>
            <p className="text-stone-600">
              {hovered.properties.from_stop_name} → {hovered.properties.to_stop_name}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {hovered.properties.p50_speed_mph.toFixed(1)} mph
            </p>
            <p className="text-stone-600">
              Median of {hovered.properties.n_traversals} trips
              {hovered.properties.n_interpolated > 0 &&
                `, ${hovered.properties.n_interpolated} with an interpolated stop time`}
            </p>
          </div>
        </Popup>
      )}
    </Map>
  );
};
