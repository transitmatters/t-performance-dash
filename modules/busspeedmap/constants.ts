import type { TimeBand } from './types';

/**
 * Buckets thinner than this are dropped before anything is drawn. The median row covers
 * only 4 traversals, so a 1- or 2-bus bucket is mostly noise.
 */
export const MIN_TRAVERSALS = 3;

/** Matches TIME_BANDS in mbta-performance's `chalicelib/lamp/bus/constants.py`. */
export const TIME_BANDS: { key: TimeBand; label: string; hours: string }[] = [
  { key: 'early_am', label: 'Early AM', hours: 'before 7am' },
  { key: 'am_peak', label: 'AM peak', hours: '7-9am' },
  { key: 'midday', label: 'Midday', hours: '9am-4pm' },
  { key: 'pm_peak', label: 'PM peak', hours: '4-6:30pm' },
  { key: 'evening', label: 'Evening', hours: '6:30-10pm' },
  { key: 'late_night', label: 'Late night', hours: 'after 10pm' },
];

export const DEFAULT_TIME_BAND: TimeBand = 'am_peak';

/**
 * Speed ramp in mph, low (slow) to high. Red-yellow-blue rather than red-green so it stays
 * readable for the ~8% of men with red-green colour vision deficiency. The system-wide
 * median is about 13.9mph, so the amber stop sits roughly at "typical".
 *
 * Consumed by both the MapLibre `interpolate` expression and the legend swatches, so the
 * two can never drift apart.
 */
export const SPEED_COLOR_STOPS: [number, string][] = [
  [4, '#a50026'],
  [9, '#f46d43'],
  [13, '#fee090'],
  [18, '#74add1'],
  [24, '#313695'],
];

/** Served same-origin: CloudFront maps this prefix onto the private performance bucket. */
export const BUS_SPEED_SEGMENTS_BASE_PATH = '/businsights/BusSpeedSegments/daily';

/** The single layer tippecanoe writes every segment into. */
export const PMTILES_SOURCE_LAYER = 'segments';

export const BOSTON_CENTER: { longitude: number; latitude: number; zoom: number } = {
  longitude: -71.0789,
  latitude: 42.3501,
  zoom: 11,
};

/**
 * Eastern Massachusetts with a generous margin, so panning can't wander off to the
 * Atlantic. [west, south, east, north].
 *
 * The margin matters: MapLibre cannot honour both the initial zoom and a bounds narrower
 * than the viewport, and fights the constraint when asked to. At zoom 11 a 2560px-wide map
 * spans ~1.76 degrees of longitude, so anything tighter than that misbehaves on an ordinary
 * desktop. This box is 2.2 degrees wide.
 */
export const MAP_MAX_BOUNDS: [number, number, number, number] = [-72.2, 41.5, -70.0, 43.0];
