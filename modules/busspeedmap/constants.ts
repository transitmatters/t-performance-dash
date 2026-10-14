import { i18n } from '../../common/i18n';
import { COLORS } from '../../common/constants/colors';
import type { DayType, DirectionFilter, Period, TimeBand } from './types';

/**
 * Buckets thinner than this are dropped before anything is drawn. The median row covers
 * only 4 traversals, so a 1- or 2-bus bucket is mostly noise.
 */
export const MIN_TRAVERSALS = 3;

/**
 * The six windows match TIME_BANDS in mbta-performance's `chalicelib/lamp/bus/constants.py`;
 * `all_day` matches ALL_DAY_BAND there, which is deliberately a separate constant because it
 * overlaps every window rather than being one. It leads the list the way "All days" leads
 * DAY_FILTER_OPTIONS, keeping the six windows in chronological order after it.
 */
export const TIME_BANDS: { key: TimeBand; label: string; hours: string }[] = [
  {
    key: 'all_day',
    label: i18n.t('busspeedmap:timeBands.allDay.label'),
    hours: i18n.t('busspeedmap:timeBands.allDay.hours'),
  },
  {
    key: 'early_am',
    label: i18n.t('busspeedmap:timeBands.earlyAm.label'),
    hours: i18n.t('busspeedmap:timeBands.earlyAm.hours'),
  },
  {
    key: 'am_peak',
    label: i18n.t('busspeedmap:timeBands.amPeak.label'),
    hours: i18n.t('busspeedmap:timeBands.amPeak.hours'),
  },
  {
    key: 'midday',
    label: i18n.t('busspeedmap:timeBands.midday.label'),
    hours: i18n.t('busspeedmap:timeBands.midday.hours'),
  },
  {
    key: 'pm_peak',
    label: i18n.t('busspeedmap:timeBands.pmPeak.label'),
    hours: i18n.t('busspeedmap:timeBands.pmPeak.hours'),
  },
  {
    key: 'evening',
    label: i18n.t('busspeedmap:timeBands.evening.label'),
    hours: i18n.t('busspeedmap:timeBands.evening.hours'),
  },
  {
    key: 'late_night',
    label: i18n.t('busspeedmap:timeBands.lateNight.label'),
    hours: i18n.t('busspeedmap:timeBands.lateNight.hours'),
  },
];

// Not all_day: its archive only exists from the pipeline's all-day backfill onwards, so
// defaulting to it would open older dates on "no data".
export const DEFAULT_TIME_BAND: TimeBand = 'am_peak';

/**
 * GTFS direction_id: 0 is outbound, 1 is inbound. Matches the hover popup's labelling in
 * BusSpeedMapView.
 */
export const DIRECTIONS: { key: DirectionFilter; label: string }[] = [
  { key: 'inbound', label: i18n.t('busspeedmap:directions.inbound') },
  { key: 'outbound', label: i18n.t('busspeedmap:directions.outbound') },
];

export const DEFAULT_DIRECTION: DirectionFilter = 'inbound';

export const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: i18n.t('busspeedmap:periods.daily') },
  { key: 'weekly', label: i18n.t('busspeedmap:periods.weekly') },
  { key: 'monthly', label: i18n.t('busspeedmap:periods.monthly') },
];

export const DEFAULT_PERIOD: Period = 'daily';
export const DEFAULT_SPEED_MAP_PERIOD: Period = 'monthly';

/**
 * Only meaningful for weekly/monthly periods -- a daily file's features carry no `day_type`
 * at all, since a single day is already wholly one type. Labels match the equivalent split
 * used for multi-day Trips (DAY_FILTER_OPTIONS in common/hooks/useChartToggle.tsx) --
 * "Weekdays" / "Weekends & holidays" -- minus its "All days" option, which has no equivalent
 * here: a weekly/monthly tile's `day_type` is always one or the other, never combined.
 */
export const DAY_TYPES: { key: DayType; label: string }[] = [
  { key: 'business_day', label: i18n.t('dayFilter.weekdays') },
  { key: 'weekend_or_holiday', label: i18n.t('dayFilter.weekendsHolidays') },
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
 * and monthly files alike, and the all_day archive as well as the band one. Weekly/monthly's
 * business-day/weekend split lives in a `day_type` feature property within this same layer
 * (see DAY_TYPES), not a separate layer.
 */
export const PMTILES_SOURCE_LAYER = 'segments';

/**
 * Subway stations and bus stops, drawn under the segments as context. One fixed archive
 * (~100KB) with no date in its path -- it's only regenerated when MBTA's GTFS feed changes.
 */
export const BUS_SPEED_STOPS_PATH = `${BUS_SPEED_SEGMENTS_BASE_PATH}/reference/stops.pmtiles`;

/**
 * Point layers inside the stops archive. Their minimum zooms (4 for stations, 11 for bus
 * stops) are baked into the tiles, so the map layers need no minzoom of their own. All
 * properties are strings; `lines`/`routes` are comma-joined lists.
 */
export const STATIONS_SOURCE_LAYER = 'stations';
export const BUS_STOPS_SOURCE_LAYER = 'bus_stops';

/**
 * Every value a station's `lines` can hold, keyed as the tileset spells it. Drives both the
 * station dot colours on the map and the line list in the station hover popup.
 */
export const STATION_LINES: Record<string, { label: string; color: string }> = {
  Red: { label: i18n.t('lines.red'), color: COLORS.mbta.red },
  Mattapan: { label: i18n.t('lines.mattapan'), color: COLORS.mbta.mattapan },
  Orange: { label: i18n.t('lines.orange'), color: COLORS.mbta.orange },
  Blue: { label: i18n.t('lines.blue'), color: COLORS.mbta.blue },
  Green: { label: i18n.t('lines.green'), color: COLORS.mbta.green },
};

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
