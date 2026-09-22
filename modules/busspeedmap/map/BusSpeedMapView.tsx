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
import { getBusRouteDisplayName } from '../../../common/constants/lines';
import {
  BOSTON_CENTER,
  MAP_MAX_BOUNDS,
  MIN_TRAVERSALS,
  PMTILES_SOURCE_LAYER,
  SPEED_COLOR_STOPS,
} from '../constants';
import type {
  BusSpeedSegmentProperties,
  DayType,
  DirectionFilter,
  Period,
  TimeBand,
} from '../types';

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

interface SegmentStops {
  from: string;
  to: string;
}

interface BusSpeedMapViewProps {
  pmtilesUrl: string;
  period: Period;
  dayType: DayType;
  timeBand: TimeBand;
  direction: DirectionFilter;
  routeFilter?: string;
  /**
   * Narrows routeFilter+direction down to exactly one segment -- used by the leaderboard's
   * single-segment dialog, which has no route/direction toggles of its own and just pins
   * these straight from the clicked row. Requires routeFilter to also be set.
   */
  segmentStops?: SegmentStops;
  /** Called with the full set of route_ids discovered so far, whenever it grows. */
  onRouteIdsDiscovered?: (routeIds: string[]) => void;
}

export const BusSpeedMapView: React.FC<BusSpeedMapViewProps> = ({
  pmtilesUrl,
  period,
  dayType,
  timeBand,
  direction,
  routeFilter,
  segmentStops,
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
    // Daily features carry no `day_type` at all (a single day is already wholly one type),
    // so this clause only applies to weekly/monthly tiles.
    if (period !== 'daily') clauses.push(['==', ['get', 'day_type'], dayType]);
    if (routeFilter) clauses.push(['==', ['get', 'route_id'], routeFilter]);
    if (segmentStops) {
      clauses.push(['==', ['get', 'from_stop_name'], segmentStops.from]);
      clauses.push(['==', ['get', 'to_stop_name'], segmentStops.to]);
    }
    // GTFS direction_id: 0 is outbound, 1 is inbound -- matches the hover popup below.
    clauses.push(['==', ['get', 'direction_id'], direction === 'inbound' ? 1 : 0]);
    return ['all', ...clauses] as unknown as FilterSpecification;
  }, [timeBand, period, dayType, routeFilter, segmentStops, direction]);

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

  // Cancels whatever fly-to retry is still pending from the previous call to runFocusFlight,
  // if any -- shared across all its call sites (see below) so a stale retry can never land
  // after a newer one has already taken over.
  const cancelPendingFlightRef = useRef<() => void>(() => {});

  // Pans/zooms to the selected route (or, in segment-focus mode, the one selected segment), and
  // back out to the network overview when the filter is cleared. A plain function rather than
  // the effect itself: segment-focus mode needs a second trigger for it (the map's own onLoad,
  // wired up below) to cover the case where the effect first runs before react-map-gl has
  // attached the underlying maplibre-gl instance to the ref -- in which case this silently
  // no-ops via the guard just below, and, for a dialog whose segment is fixed for its whole
  // lifetime, nothing else would ever come along to retry it.
  const runFocusFlight = useCallback(() => {
    cancelPendingFlightRef.current();

    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!routeFilter) {
      map.easeTo({
        center: [BOSTON_CENTER.longitude, BOSTON_CENTER.latitude],
        zoom: BOSTON_CENTER.zoom,
        duration: 800,
      });
      return;
    }

    const focusFilterClauses: FilterSpecification[] = [['==', ['get', 'route_id'], routeFilter]];
    if (segmentStops) {
      focusFilterClauses.push(
        ['==', ['get', 'from_stop_name'], segmentStops.from],
        ['==', ['get', 'to_stop_name'], segmentStops.to],
        ['==', ['get', 'direction_id'], direction === 'inbound' ? 1 : 0]
      );
    }
    const focusFilterExpression = ['all', ...focusFilterClauses] as unknown as FilterSpecification;

    const boundsOfLoadedFocus = (): LngLatBounds | undefined => {
      const features = map.querySourceFeatures(SOURCE_ID, {
        sourceLayer: PMTILES_SOURCE_LAYER,
        filter: focusFilterExpression,
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
    cancelPendingFlightRef.current = () => {
      cancelled = true;
    };

    // Bounded to one retry: tiles for the focus may not be loaded yet if the user (or, on
    // first mount in segment-focus mode, the default view) was somewhere else, so jump (no
    // animation) to the low zoom that covers the whole network -- per PMTILES_SOURCE_LAYER's
    // zoom range, that's guaranteed to have every route's geometry -- and try again once those
    // tiles are in. If the focus still has nothing after that, it's missing at all zooms and
    // there's nothing sensible left to fly to.
    const attempt = (isRetry: boolean) => {
      if (cancelled) return;
      const bounds = boundsOfLoadedFocus();
      if (bounds) {
        // A single segment is often just one short block -- a much tighter maxZoom than a
        // whole route so the dialog map actually reads at street level instead of stopping at
        // the same zoom a multi-mile route would.
        map.fitBounds(bounds, { padding: 48, duration: 800, maxZoom: segmentStops ? 18 : 15 });
      } else if (!isRetry) {
        map.once('idle', () => attempt(true));
        map.jumpTo({ center: [BOSTON_CENTER.longitude, BOSTON_CENTER.latitude], zoom: 8 });
      }
    };
    attempt(false);
  }, [routeFilter, segmentStops, direction]);

  // What the effect below reacts to. For an ordinary route selection that's just the route id
  // -- direction is a display toggle there, not part of what to fly to. In segment-focus mode
  // direction and the stop names are folded in too, since together with the route they pin
  // down one exact line rather than a whole route's worth of them. Keeping this a plain route
  // id in the ordinary case (rather than always including direction) matters: it means
  // toggling direction on the full map never re-triggers a fly-to, preserving today's
  // "direction is just a filter, not a fly-to" feel.
  const focusKey = segmentStops
    ? `${routeFilter ?? ''}|${direction}|${segmentStops.from}|${segmentStops.to}`
    : routeFilter;

  // Re-runs the fly-to on every focus change, and back out to the network overview when the
  // filter is cleared. Skipped on mount for an ordinary route selection: the initial view is
  // already correct, and firing here too would flash a redundant animation to the same spot.
  // Segment-focus mode has no such "already correct" default, so it flies in on mount too
  // (backstopped by the map's own onLoad below, in case the map isn't attached yet at this
  // point).
  useEffect(() => {
    const skippingInitialRender = isFirstRender.current && !segmentStops;
    isFirstRender.current = false;
    if (skippingInitialRender) return;

    runFocusFlight();
    return () => cancelPendingFlightRef.current();
    // runFocusFlight is recreated only when focusKey's own inputs (routeFilter, direction,
    // segmentStops) change, so it's redundant here -- focusKey is the one true dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

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
      // Backstops the focus effect above for the case it ran before react-map-gl had
      // attached the underlying maplibre-gl instance to the ref (runFocusFlight's own `!map`
      // guard makes that a silent no-op there). Most relevant to segment-focus mode, whose
      // dialog mounts with its focus already fixed and so gets no later focusKey change to
      // retry on; harmless for the ordinary route page, where this just re-eases to the same
      // default view nothing has moved from yet.
      onLoad={runFocusFlight}
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
              Route {getBusRouteDisplayName(hovered.properties.route_id)}
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
              {period !== 'daily' && ` this ${period === 'weekly' ? 'week' : 'month'}`}
              {hovered.properties.n_interpolated > 0 &&
                `, ${hovered.properties.n_interpolated} with an interpolated stop time`}
            </p>
          </div>
        </Popup>
      )}
    </Map>
  );
};
