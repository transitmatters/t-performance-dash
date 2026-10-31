import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addProtocol, LngLatBounds, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import type { RangeResponse, Source as PMTilesSource } from 'pmtiles';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import type {
  DataDrivenPropertyValueSpecification,
  FilterSpecification,
  MapGeoJSONFeature,
  Map as MaplibreMap,
} from 'maplibre-gl';
import { useBusSpeedStops } from '../../../common/api/hooks/busSpeedSegments';
import { getBusRouteDisplayName, getBusRouteIds } from '../../../common/constants/lines';
import {
  BOSTON_CENTER,
  BUS_SPEED_STOPS_PATH,
  BUS_STOPS_SOURCE_LAYER,
  MAP_MAX_BOUNDS,
  MIN_TRAVERSALS,
  NETWORK_BOUNDS,
  PMTILES_SOURCE_LAYER,
  SPEED_COLOR_STOPS,
  STATION_LINES,
  STATIONS_SOURCE_LAYER,
} from '../constants';
import type {
  BusSpeedSegmentProperties,
  BusStopProperties,
  DayType,
  DirectionFilter,
  Period,
  StationProperties,
  TimeBand,
} from '../types';
import { SegmentPopupContent } from './BusSpeedSegmentPopupContent';
import { BusStopPopupContent, StationPopupContent } from './BusSpeedStopPopupContent';
import { ResetViewControl } from './ResetViewControl';

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

/** Serves an archive already held in memory, so maplibre never goes back to the network for it. */
class ArrayBufferSource implements PMTilesSource {
  constructor(
    private readonly key: string,
    private readonly buffer: ArrayBuffer
  ) {}

  getKey() {
    return this.key;
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    return { data: this.buffer.slice(offset, offset + length) };
  }
}

/**
 * Hands the fetched stops archive to the pmtiles protocol under its real URL, and returns the
 * pmtiles:// URL a Source can point at. The protocol resolves that URL to this in-memory
 * instance instead of opening a fetch-backed one of its own.
 */
const registerStopsArchive = (buffer: ArrayBuffer): string => {
  const key = new URL(BUS_SPEED_STOPS_PATH, window.location.origin).toString();
  if (!protocol.get(key)) protocol.add(new PMTiles(new ArrayBufferSource(key, buffer)));
  return `pmtiles://${key}`;
};

// CARTO's Positron. Free to use with attribution, and already the basemap TransitMatters
// uses in otp-app, so there is no per-load billing to worry about here.
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const SOURCE_ID = 'bus-speed-segments';
const ARROWS_LAYER_ID = 'bus-speed-direction-arrows';
const ARROW_IMAGE_ID = 'bus-speed-direction-arrow';
const HITBOX_LAYER_ID = 'bus-speed-hitbox';
const CASING_LAYER_ID = 'bus-speed-casing';
const STOPS_SOURCE_ID = 'bus-speed-stops';
const STATIONS_LAYER_ID = 'bus-speed-stations';
const STATION_HITBOX_LAYER_ID = 'bus-speed-station-hitbox';
const BUS_STOP_HITBOX_LAYER_ID = 'bus-speed-bus-stop-hitbox';

const speedColor: DataDrivenPropertyValueSpecification<string> = [
  'interpolate',
  ['linear'],
  ['get', 'p50_speed_mph'],
  ...SPEED_COLOR_STOPS.flat(),
] as unknown as DataDrivenPropertyValueSpecification<string>;

/** The camera that fits the whole network in view, which depends on the map's current size. */
const networkView = (map: MaplibreMap) => map.cameraForBounds(NETWORK_BOUNDS, { padding: 24 });

/** Stops zooming out once the whole network is in view. Re-run whenever the map resizes. */
const limitZoomOut = (map: MaplibreMap) => {
  const view = networkView(map);
  if (view?.zoom !== undefined) map.setMinZoom(view.zoom);
};

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
const hoverHaloWidth = zoomWidth(7, 11, 16);

/** Below this the segments are too short and dense for arrows to read as anything but noise. */
const ARROWS_MIN_ZOOM = 13;
const arrowSize = [
  'interpolate',
  ['linear'],
  ['zoom'],
  ARROWS_MIN_ZOOM,
  0.7,
  16,
  1,
  // The leaderboard dialog zooms to 18 on a single segment, where the arrow is the point.
  18,
  1.3,
] as unknown as DataDrivenPropertyValueSpecification<number>;

/**
 * A right-pointing chevron, drawn here rather than shipped as a file. A line-placed symbol's
 * icon is rotated so its +x axis follows the line's own drawing order, and every segment is
 * cut from its pattern's shape from-stop to to-stop, so this points the way the bus travels.
 * White on a dark edge, so it reads against every colour on the speed ramp.
 */
const addArrowImage = (map: MaplibreMap) => {
  if (map.hasImage(ARROW_IMAGE_ID)) return;
  const pixelRatio = 2;
  const size = 16 * pixelRatio;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(size * 0.3, size * 0.18);
  context.lineTo(size * 0.68, size * 0.5);
  context.lineTo(size * 0.3, size * 0.82);
  context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  context.lineWidth = 5 * pixelRatio;
  context.stroke();
  context.strokeStyle = '#ffffff';
  context.lineWidth = 2.5 * pixelRatio;
  context.stroke();

  map.addImage(ARROW_IMAGE_ID, context.getImageData(0, 0, size, size), { pixelRatio });
};

/**
 * Single-line stations take their line's colour. Stations on more than one line (`lines` is
 * comma-joined, e.g. "Red,Green") are drawn white with a dark ring, the usual map convention
 * for a transfer.
 */
const stationColor: DataDrivenPropertyValueSpecification<string> = [
  'case',
  ['in', ',', ['get', 'lines']],
  '#ffffff',
  [
    'match',
    ['get', 'lines'],
    ...Object.entries(STATION_LINES).flatMap(([line, { color }]) => [line, color]),
    '#6b7280',
  ],
] as unknown as DataDrivenPropertyValueSpecification<string>;

const stationStrokeColor: DataDrivenPropertyValueSpecification<string> = [
  'case',
  ['in', ',', ['get', 'lines']],
  '#1c1c1c',
  '#ffffff',
] as unknown as DataDrivenPropertyValueSpecification<string>;

const zoomRadius = (
  atZoom: number,
  radius: number,
  atHighZoom: number,
  highRadius: number
): DataDrivenPropertyValueSpecification<number> =>
  [
    'interpolate',
    ['linear'],
    ['zoom'],
    atZoom,
    radius,
    atHighZoom,
    highRadius,
  ] as unknown as DataDrivenPropertyValueSpecification<number>;

const stationRadius = zoomRadius(8, 2, 16, 7);
const busStopRadius = zoomRadius(11, 1.5, 16, 4);
// A few pixels past the drawn dot -- bus stops are only 3-8px across, too fine to hover.
const stationHitRadius = zoomRadius(8, 6, 16, 11);
const busStopHitRadius = zoomRadius(11, 5, 16, 8);
// The hovered stop is redrawn above the segments, a little larger, so it isn't lost under them.
const hoveredStationRadius = zoomRadius(8, 4, 16, 9);
const hoveredBusStopRadius = zoomRadius(11, 4, 16, 6);

/** MBTA bus brand yellow (COLORS.mbta.bus) -- stands out against the speed ramp and the
 * basemap alike, and reads as "bus" rather than an arbitrary selection color. */
const HOVER_HALO_COLOR = '#FFC72C';

type Hovered = { longitude: number; latitude: number; anchor: 'top-left' | 'bottom-left' } & (
  | { kind: 'segment'; segments: BusSpeedSegmentProperties[] }
  | { kind: 'station'; properties: StationProperties }
  | { kind: 'busStop'; properties: BusStopProperties }
);

/**
 * Stops win over segments when both are under the cursor: every bus stop sits at a segment's
 * end, inside the segment's fat hitbox, so segment-first would make stops unhoverable.
 */
const HOVER_PRIORITY: [string, Hovered['kind']][] = [
  [STATION_HITBOX_LAYER_ID, 'station'],
  [BUS_STOP_HITBOX_LAYER_ID, 'busStop'],
  [HITBOX_LAYER_ID, 'segment'],
];
const INTERACTIVE_LAYER_IDS = HOVER_PRIORITY.map(([layerId]) => layerId);

/**
 * Every route drawn on the hovered segment, in route order. Routes sharing a street are drawn
 * exactly over one another (SL4 and SL5 along Washington St, say), so the topmost feature alone
 * would hide the rest. Matched on the stop pair rather than taking everything under the cursor,
 * which near a stop also catches the next segment along and any cross street; one per route,
 * since a segment crossing a tile boundary comes back once per tile.
 */
const segmentsSharingStops = (
  features: MapGeoJSONFeature[],
  hovered: BusSpeedSegmentProperties
): BusSpeedSegmentProperties[] => {
  const matches = features
    .filter((feature) => feature.layer.id === HITBOX_LAYER_ID)
    .map((feature) => feature.properties as BusSpeedSegmentProperties)
    .filter(
      (segment) =>
        segment.direction_id === hovered.direction_id &&
        segment.from_stop_name === hovered.from_stop_name &&
        segment.to_stop_name === hovered.to_stop_name
    );
  return matches
    .filter(
      (segment, index) =>
        matches.findIndex((other) => other.route_id === segment.route_id) === index
    )
    .sort((a, b) =>
      getBusRouteDisplayName(a.route_id).localeCompare(getBusRouteDisplayName(b.route_id), 'en', {
        numeric: true,
      })
    );
};

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
  /**
   * A raw route_id or a curated BusRoute label; composites like 114/116/117 or
   * SL1/SL2/SL3/SLW show every route_id behind them (see getBusRouteIds).
   */
  routeFilter?: string;
  /**
   * Narrows routeFilter+direction down to exactly one segment -- used by the leaderboard's
   * single-segment dialog, which has no route/direction toggles of its own and just pins
   * these straight from the clicked row. Requires routeFilter to also be set.
   */
  segmentStops?: SegmentStops;
}

export const BusSpeedMapView = ({
  pmtilesUrl,
  period,
  dayType,
  timeBand,
  direction,
  routeFilter,
  segmentStops,
}: BusSpeedMapViewProps) => {
  const [hovered, setHovered] = useState<Hovered | undefined>();
  // The arrow layer only mounts once its image exists: maplibre drops a symbol whose icon is
  // missing when its tile is laid out, and wouldn't lay that tile out again just for the image.
  const [arrowImageReady, setArrowImageReady] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const routeFilterClause = useMemo<FilterSpecification | undefined>(
    () =>
      routeFilter
        ? ([
            'in',
            ['get', 'route_id'],
            ['literal', getBusRouteIds(routeFilter)],
          ] as unknown as FilterSpecification)
        : undefined,
    [routeFilter]
  );

  // Bus stops follow the route filter, so a selected route's stops aren't lost among every
  // other route's. `routes` is a comma-joined string, and a bare `in` would let "1" match
  // inside "111" -- comma-wrapping both sides makes it an exact match.
  const busStopsFilter = useMemo<FilterSpecification | undefined>(
    () =>
      routeFilter
        ? ([
            'any',
            ...getBusRouteIds(routeFilter).map((routeId) => [
              'in',
              `,${routeId},`,
              ['concat', ',', ['get', 'routes'], ','],
            ]),
          ] as unknown as FilterSpecification)
        : undefined,
    [routeFilter]
  );

  // Undefined until the archive loads, and for good if it's missing or fails -- the stops are
  // context only, so the map carries on without them.
  const { data: stopsArchive } = useBusSpeedStops();
  const stopsUrl = useMemo(
    () => (stopsArchive ? registerStopsArchive(stopsArchive) : undefined),
    [stopsArchive]
  );

  const filter = useMemo<FilterSpecification>(() => {
    const clauses: FilterSpecification[] = [
      ['>=', ['get', 'n_traversals'], MIN_TRAVERSALS],
      ['==', ['get', 'time_band'], timeBand],
    ];
    // Daily features carry no `day_type` at all (a single day is already wholly one type),
    // so this clause only applies to weekly/monthly tiles.
    if (period !== 'daily') clauses.push(['==', ['get', 'day_type'], dayType]);
    if (routeFilterClause) clauses.push(routeFilterClause);
    if (segmentStops) {
      clauses.push(['==', ['get', 'from_stop_name'], segmentStops.from]);
      clauses.push(['==', ['get', 'to_stop_name'], segmentStops.to]);
    }
    // GTFS direction_id: 0 is outbound, 1 is inbound -- matches the hover popup below.
    clauses.push(['==', ['get', 'direction_id'], direction === 'inbound' ? 1 : 0]);
    return ['all', ...clauses] as unknown as FilterSpecification;
  }, [timeBand, period, dayType, routeFilterClause, segmentStops, direction]);

  // Identifies the exact hovered features (one per route on the segment) so the halo layer
  // below can single them out -- the same route_id/direction_id/from/to tuple used as a
  // segment's natural key elsewhere (e.g. BusSpeedSegmentLeaderboard's list key).
  const hoveredFilter = useMemo<FilterSpecification | undefined>(() => {
    if (hovered?.kind !== 'segment') return undefined;
    const [{ direction_id, from_stop_name, to_stop_name }] = hovered.segments;
    return [
      'all',
      ['in', ['get', 'route_id'], ['literal', hovered.segments.map((segment) => segment.route_id)]],
      ['==', ['get', 'direction_id'], direction_id],
      ['==', ['get', 'from_stop_name'], from_stop_name],
      ['==', ['get', 'to_stop_name'], to_stop_name],
    ] as unknown as FilterSpecification;
  }, [hovered]);

  const onMouseMove = (event: MapLayerMouseEvent) => {
    const features = event.features ?? [];
    for (const [layerId, kind] of HOVER_PRIORITY) {
      const feature = features.find((candidate) => candidate.layer.id === layerId);
      if (!feature) continue;
      const position = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        // Grows away from the nearer top or bottom edge, so a tall popup (several routes on one
        // segment, on a short phone-sized map) isn't cut off by it.
        anchor:
          event.point.y < event.target.getContainer().clientHeight / 2
            ? ('top-left' as const)
            : ('bottom-left' as const),
      };
      setHovered(
        kind === 'segment'
          ? {
              kind,
              ...position,
              segments: segmentsSharingStops(
                features,
                feature.properties as BusSpeedSegmentProperties
              ),
            }
          : ({ kind, ...position, properties: feature.properties } as Hovered)
      );
      return;
    }
    setHovered(undefined);
  };

  const hoveredStopId =
    hovered && hovered.kind !== 'segment' ? hovered.properties.stop_id : undefined;

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

    if (!routeFilterClause) {
      map.easeTo({
        center: [BOSTON_CENTER.longitude, BOSTON_CENTER.latitude],
        zoom: BOSTON_CENTER.zoom,
        duration: 800,
      });
      return;
    }

    const focusFilterClauses: FilterSpecification[] = [routeFilterClause];
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
    // animation) out to the whole network -- checked against a real month's tiles, every route
    // with geometry at zoom 8 still has it at 9-11 -- and try again once those tiles are in. If
    // the focus still has nothing after that, it's missing at all zooms and there's nothing
    // sensible left to fly to.
    const attempt = (isRetry: boolean) => {
      if (cancelled) return;
      const bounds = boundsOfLoadedFocus();
      if (bounds) {
        // A single segment is often just one short block -- a much tighter maxZoom than a
        // whole route so the dialog map actually reads at street level instead of stopping at
        // the same zoom a multi-mile route would.
        map.fitBounds(bounds, { padding: 48, duration: 800, maxZoom: segmentStops ? 18 : 15 });
      } else if (!isRetry) {
        const view = networkView(map);
        if (!view) return;
        map.once('idle', () => attempt(true));
        map.jumpTo(view);
      }
    };
    attempt(false);
  }, [routeFilterClause, segmentStops, direction]);

  // The home button. With nothing selected that's just the network overview, but a focus can't
  // be fitted straight from where the user is: zoomed in, only the tiles on screen are loaded,
  // so the bounds would come out as the part of the route already in view. Ease out to the whole
  // network first and fit once its tiles are in. Cancelled like any pending flight, so changing
  // the focus mid-way wins.
  const resetView = () => {
    const map = mapRef.current?.getMap();
    const view = map && networkView(map);
    if (!map || !view || !routeFilterClause) {
      runFocusFlight();
      return;
    }
    cancelPendingFlightRef.current();
    let cancelled = false;
    cancelPendingFlightRef.current = () => {
      cancelled = true;
    };
    map.once('idle', () => {
      if (!cancelled) runFocusFlight();
    });
    map.easeTo({ ...view, duration: 400 });
  };

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
  // filter is cleared. Skipped on mount for an ordinary route selection: the map's own onLoad
  // below flies to a route that's already selected on mount, and firing here too would race it.
  // Segment-focus mode flies in on mount too (backstopped by onLoad, in case the map isn't
  // attached yet at this point).
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
      // react-map-gl skips any not yet in the style, so the stop hitboxes can be listed before
      // the stops archive has loaded.
      interactiveLayerIds={INTERACTIVE_LAYER_IDS}
      cursor={hovered ? 'pointer' : 'grab'}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHovered(undefined)}
      // Backstops the focus effect above for the case it ran before react-map-gl had
      // attached the underlying maplibre-gl instance to the ref (runFocusFlight's own `!map`
      // guard makes that a silent no-op there). Most relevant to segment-focus mode, whose
      // dialog mounts with its focus already fixed and so gets no later focusKey change to
      // retry on. On the ordinary route page it flies to a route selected via the URL (e.g. from
      // the leaderboard), or just re-eases to the default view nothing has moved from yet.
      onLoad={(event) => {
        addArrowImage(event.target);
        setArrowImageReady(true);
        limitZoomOut(event.target);
        runFocusFlight();
      }}
      onResize={(event) => limitZoomOut(event.target)}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <ResetViewControl onReset={resetView} />
      <Source id={SOURCE_ID} type="vector" url={`pmtiles://${pmtilesUrl}`}>
        {/* Sits beneath the casing and line below, so it reads as a glow around the hovered
            segment rather than covering it. */}
        {hoveredFilter && (
          <Layer
            id="bus-speed-hover-halo"
            type="line"
            source-layer={PMTILES_SOURCE_LAYER}
            filter={hoveredFilter}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': HOVER_HALO_COLOR, 'line-width': hoverHaloWidth }}
          />
        )}
        {/* A dark casing under the ramp. Positron is nearly white, so the pale middle of
            the speed scale would otherwise disappear into the basemap. */}
        <Layer
          id={CASING_LAYER_ID}
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
        {/* Direction of travel, only once a route is picked: unfiltered, many routes share each
            street and one route's inbound can run against another's, so arrows there would be
            noise. Mounts after the image (see arrowImageReady), so beforeId keeps it just above
            the lines rather than on top of the stops. */}
        {arrowImageReady && routeFilterClause && (
          <Layer
            id={ARROWS_LAYER_ID}
            type="symbol"
            source-layer={PMTILES_SOURCE_LAYER}
            filter={filter}
            minzoom={ARROWS_MIN_ZOOM}
            beforeId={HITBOX_LAYER_ID}
            layout={{
              'symbol-placement': 'line',
              'symbol-spacing': 80,
              'icon-image': ARROW_IMAGE_ID,
              'icon-size': arrowSize,
              'icon-rotation-alignment': 'map',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            }}
          />
        )}
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

      {/* Declared after the segments so the casing exists to slot beneath: the archive loads
          on its own schedule, and a layer added without a beforeId would land on top. Stations
          sit above bus stops, both below every segment layer. */}
      {stopsUrl && (
        <Source id={STOPS_SOURCE_ID} type="vector" url={stopsUrl}>
          <Layer
            id={STATIONS_LAYER_ID}
            type="circle"
            source-layer={STATIONS_SOURCE_LAYER}
            beforeId={CASING_LAYER_ID}
            paint={{
              'circle-color': stationColor,
              'circle-radius': stationRadius,
              'circle-stroke-color': stationStrokeColor,
              'circle-stroke-width': 1.5,
            }}
          />
          <Layer
            id="bus-speed-bus-stops"
            type="circle"
            source-layer={BUS_STOPS_SOURCE_LAYER}
            beforeId={STATIONS_LAYER_ID}
            // Spread rather than passed as `filter={busStopsFilter}`: react-map-gl forwards an
            // explicit `filter: undefined` to maplibre, which rejects the whole layer over it.
            {...(busStopsFilter && { filter: busStopsFilter })}
            paint={{
              'circle-color': '#ffffff',
              'circle-radius': busStopRadius,
              'circle-stroke-color': '#78716c',
              'circle-stroke-width': 1,
            }}
          />
          {/* Invisible, and added without a beforeId so they sit on top -- harmless at zero
              opacity. */}
          <Layer
            id={STATION_HITBOX_LAYER_ID}
            type="circle"
            source-layer={STATIONS_SOURCE_LAYER}
            paint={{ 'circle-opacity': 0, 'circle-radius': stationHitRadius }}
          />
          <Layer
            id={BUS_STOP_HITBOX_LAYER_ID}
            type="circle"
            source-layer={BUS_STOPS_SOURCE_LAYER}
            {...(busStopsFilter && { filter: busStopsFilter })}
            paint={{ 'circle-opacity': 0, 'circle-radius': busStopHitRadius }}
          />
          {/* Mounted on hover, so it lands on top of everything, segments included. */}
          {hoveredStopId && (
            <Layer
              id="bus-speed-hovered-stop"
              type="circle"
              source-layer={
                hovered?.kind === 'station' ? STATIONS_SOURCE_LAYER : BUS_STOPS_SOURCE_LAYER
              }
              filter={['==', ['get', 'stop_id'], hoveredStopId]}
              paint={{
                'circle-color': hovered?.kind === 'station' ? stationColor : '#ffffff',
                'circle-radius':
                  hovered?.kind === 'station' ? hoveredStationRadius : hoveredBusStopRadius,
                'circle-stroke-color': HOVER_HALO_COLOR,
                'circle-stroke-width': 3,
              }}
            />
          )}
        </Source>
      )}

      {hovered && (
        <Popup
          longitude={hovered.longitude}
          latitude={hovered.latitude}
          closeButton={false}
          closeOnClick={false}
          maxWidth="280px"
          // Always to the right of the cursor rather than letting MapLibre auto-flip the anchor
          // near viewport edges -- that default placed the box right over the cursor (and the
          // segment it's describing) more often than not. Only up or down varies.
          anchor={hovered.anchor}
          offset={16}
        >
          {hovered.kind === 'station' && <StationPopupContent station={hovered.properties} />}
          {hovered.kind === 'busStop' && <BusStopPopupContent busStop={hovered.properties} />}
          {hovered.kind === 'segment' && (
            <SegmentPopupContent segments={hovered.segments} period={period} />
          )}
        </Popup>
      )}
    </Map>
  );
};
