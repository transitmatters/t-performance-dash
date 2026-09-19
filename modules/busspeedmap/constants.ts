import type { DayType, DirectionFilter, Period, TimeBand } from './types';

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
 * GTFS direction_id: 0 is outbound, 1 is inbound. Matches the hover popup's labelling in
 * BusSpeedMapView.
 */
export const DIRECTIONS: { key: DirectionFilter; label: string }[] = [
  { key: 'inbound', label: 'Inbound' },
  { key: 'outbound', label: 'Outbound' },
];

export const DEFAULT_DIRECTION: DirectionFilter = 'inbound';

export const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
];

export const DEFAULT_PERIOD: Period = 'daily';

/**
 * Only meaningful for weekly/monthly periods -- a daily file's features carry no `day_type`
 * at all, since a single day is already wholly one type. Labels match the equivalent split
 * used for multi-day Trips (DAY_FILTER_OPTIONS in common/hooks/useChartToggle.tsx) --
 * "Weekdays" / "Weekends & holidays" -- minus its "All days" option, which has no equivalent
 * here: a weekly/monthly tile's `day_type` is always one or the other, never combined.
 */
export const DAY_TYPES: { key: DayType; label: string }[] = [
  { key: 'business_day', label: 'Weekdays' },
  { key: 'weekend_or_holiday', label: 'Weekends & holidays' },
];

export const DEFAULT_DAY_TYPE: DayType = 'business_day';

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

/**
 * Served same-origin: CloudFront maps this prefix onto the private performance bucket.
 * `daily`/`weekly`/`monthly` sit below it -- see `busSpeedSegmentsPath` in
 * common/api/busSpeedSegments.ts.
 */
export const BUS_SPEED_SEGMENTS_BASE_PATH = '/businsights/BusSpeedSegments';

/**
 * The single layer tippecanoe writes every segment into, for every period -- daily, weekly,
 * and monthly files alike. Weekly/monthly's business-day/weekend split lives in a `day_type`
 * feature property within this same layer (see DAY_TYPES), not a separate layer.
 */
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
