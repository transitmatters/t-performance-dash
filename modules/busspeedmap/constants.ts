import { COLORS } from '../../common/constants/colors';
import { mayIncludeTrackingGaps, sumTrips } from '../../common/utils/busTripCounts';
import { BUNCHED, headwayShare, ON_TIME } from '../reliability/utils';
import type {
  DayType,
  DirectionFilter,
  LeaderboardMetric,
  LeaderboardMetricConfig,
  Period,
  SegmentColorBy,
  TerminalSection,
  TimeBand,
} from './types';

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
  { key: 'all_day', label: 'All day', hours: 'all service hours' },
  { key: 'early_am', label: 'Early AM', hours: 'before 7am' },
  { key: 'am_peak', label: 'AM peak', hours: '7-9am' },
  { key: 'midday', label: 'Midday', hours: '9am-4pm' },
  { key: 'pm_peak', label: 'PM peak', hours: '4-6:30pm' },
  { key: 'evening', label: 'Evening', hours: '6:30-10pm' },
  { key: 'late_night', label: 'Late night', hours: 'after 10pm' },
];

/** What a terminal section's numbers need read alongside them, in its popup. */
export const TERMINAL_SECTION_NOTES: Record<TerminalSection, string> = {
  first: "First section of most trips. Waiting to leave isn't counted.",
  last: 'Last section of most trips, which tend to run slower than the rest of a route.',
};

// Not all_day: its archive only exists from the pipeline's all-day backfill onwards, so
// defaulting to it would open older dates on "no data".
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
export const DEFAULT_SPEED_MAP_PERIOD: Period = 'monthly';

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
 * readable for the ~8% of men with red-green colour vision deficiency.
 *
 * Unchanged when the map moved from arrival-to-arrival to running speed, so older archives
 * (system-wide about 13.3 mph) and newer ones (about 15.8 mph, as dwell is left out) read on the
 * same scale. On 2026-11-04 every length band of segment from 125m up ran a median 12-17 mph.
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

/** A segment with no speed to draw: too short to time (see MIN_RUNNING_SPEED_SEGMENT_M). */
export const NO_SPEED_COLOR = '#a8a29e';

export const COLOR_BY_OPTIONS: { key: SegmentColorBy; label: string }[] = [
  { key: 'speed', label: 'Speed' },
  { key: 'delay', label: 'Delay' },
];

export const DEFAULT_COLOR_BY: SegmentColorBy = 'speed';

/** When a segment's free-flow running time is taken from: mbta-performance's FREE_FLOW_WINDOWS. */
export const FREE_FLOW_HOURS = 'before 6am and after 10pm';

/**
 * Running time over free-flow running time, as in light traffic (1) to three times as long. The
 * speed ramp's colours in reverse, so red means slow in either view.
 *
 * Spread to fit the PM peak, the worst band. On weekdays in October 2026, its segments' median was
 * 1.22, with a quarter of them over 1.5, one in ten over 2, and one in thirty over 2.85. The AM
 * peak's median was 1.13 and midday's 1.12.
 */
export const DELAY_COLOR_STOPS: [number, string][] = [
  [1, '#313695'],
  [1.25, '#74add1'],
  [1.5, '#fee090'],
  [2, '#f46d43'],
  [3, '#a50026'],
];

/**
 * mbta-performance's MIN_RUNNING_SPEED_SEGMENT_M: segments shorter than this have no running
 * speed, as the 90m around their stops that LAMP's times leave out is most of them.
 */
export const MIN_RUNNING_SPEED_SEGMENT_M = 125;

/**
 * Median dwell in seconds, and the dot radius at zoom 16 that stands for it. The dot's area
 * rather than its radius grows with the dwell, so a 60s stop doesn't look four times a 15s one.
 * Consumed by both the map and the legend.
 */
export const DWELL_RADIUS_STOPS: [number, number][] = [
  [0, 2],
  [15, 4.5],
  [30, 6],
  [60, 8.5],
  [120, 12],
];

/** Dwell dots are dark with a white edge, so they sit apart from the speed ramp under them. */
export const DWELL_COLOR = '#292524';

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
 * From here up every archive holds every segment. Below it a month's band archive keeps about one
 * stop pair in six (the pipeline's --drop-densest-as-needed), so a stop's popup would list some of
 * its routes' dwell and silently miss the rest. Only for archives with dwell on the segments; the
 * dwell archive's own tiles start at DWELL_MINIMUM_ZOOM with every stop in them.
 */
export const STOP_DWELL_MINIMUM_ZOOM = 12;

/**
 * The layer tippecanoe writes the dwell points into (mbta-performance's DWELL_LAYER_NAME), in an
 * archive of their own beside each segments archive (see busDwellsPath).
 */
export const DWELLS_SOURCE_LAYER = 'dwells';

/**
 * The dwell archive's tiles start at zoom 11, where the stops reference archive's bus stops do,
 * and keep every stop from there up. The dots wait a level longer: at 11, a stop every few hundred
 * metres on every route is a smear across downtown.
 */
export const DWELL_MINIMUM_ZOOM = 11;
export const DWELL_DOTS_MINIMUM_ZOOM = 12;

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
  Red: { label: 'Red Line', color: COLORS.mbta.red },
  Mattapan: { label: 'Mattapan Line', color: COLORS.mbta.mattapan },
  Orange: { label: 'Orange Line', color: COLORS.mbta.orange },
  Blue: { label: 'Blue Line', color: COLORS.mbta.blue },
  Green: { label: 'Green Line', color: COLORS.mbta.green },
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

/**
 * The whole bus network, [west, south, east, north]: the extent of every segment in a real
 * month's tiles (2026-09), rounded out a little. The map zooms out no further than fits this in
 * view, whatever its size (see limitZoomOut in BusSpeedMapView). MAP_MAX_BOUNDS alone stops at
 * whatever zoom fits that much larger box to the viewport, which on a phone is most of New England.
 */
export const NETWORK_BOUNDS: [number, number, number, number] = [-71.3, 42.1, -70.84, 42.59];

/**
 * Selects every route behind a composite like SL4/SL5 at once, in the control that narrows the
 * map to one of them. Never a real route_id.
 */
export const ALL_ROUTES = 'all';

/**
 * Routes need at least this many scheduled trips in the month to be ranked by dropped trips, so one
 * or two dropped trips can't put a small route near the top. In October 2026, Route 451 (2 of 252
 * trips) would otherwise have ranked 8th, ahead of Route 1. At 500, one dropped trip moves a rate by
 * 0.2 points at most. Before grouping, the route_ids under it that month (17 of 152) ran at most 21
 * trips a day.
 */
export const MIN_SCHEDULED_TRIPS = 500;

/** One decimal, without rounding down to 0% while any trip was dropped. */
const formatDroppedPct = (pct: number) => (pct > 0 && pct < 0.05 ? '<0.1%' : `${pct.toFixed(1)}%`);

/**
 * The Rank by options on the route leaderboard. Speed leads and is the default, as the page
 * was a speed leaderboard first.
 */
export const LEADERBOARD_METRICS: LeaderboardMetricConfig[] = [
  {
    key: 'speed',
    label: 'Speed',
    title: 'Slowest routes',
    rankedBy: 'Ranked by average speed',
    value: (entry) =>
      entry.total_time > 0 ? entry.miles_covered / (entry.total_time / 3600) : undefined,
    format: (mph) => `${mph.toFixed(1)} mph`,
    order: 'ascending',
    emptyMessage: 'No route has speed data for this period.',
  },
  {
    key: 'battery',
    label: 'Battery-electric',
    title: 'Most battery-electric trips',
    rankedBy: 'Ranked by share of trips on battery-electric buses',
    // Battery buses run on only a handful of routes, so the rest (0%, or no fleet data) are left
    // off rather than listed as a long tie for last.
    value: (entry) => (entry.pct_battery_trips ? entry.pct_battery_trips : undefined),
    format: (pct) => `${pct.toFixed(1)}%`,
    order: 'descending',
    emptyMessage: 'No battery-electric buses ran on these routes in this period.',
  },
  {
    key: 'bunched',
    label: 'Bunched',
    title: 'Most bunched routes',
    rankedBy: 'Ranked by share of headways at half the scheduled headway or less',
    // Headways are pooled from frequent routes only (groupLeaderboardByBusRoute), so other routes
    // have none and drop out.
    value: (entry) => headwayShare(entry, BUNCHED),
    format: (pct) => `${pct.toFixed(1)}% bunched`,
    order: 'descending',
    emptyMessage:
      'No frequent route has headways counted for this period. Counts start Dec 24, 2025.',
    frequentOnly: true,
  },
  {
    key: 'reliability',
    label: 'Reliability',
    title: 'Least reliable routes',
    rankedBy: 'Ranked by share of headways within 75–125% of schedule',
    value: (entry) => headwayShare(entry, ON_TIME),
    format: (pct) => `${pct.toFixed(1)}% within 75–125%`,
    order: 'ascending',
    emptyMessage:
      'No frequent route has headways counted for this period. Counts start Dec 24, 2025.',
    frequentOnly: true,
  },
  {
    key: 'dropped',
    label: 'Dropped trips',
    title: 'Most dropped trips',
    rankedBy: 'Ranked by share of scheduled trips dropped (est.)',
    // Pooled over the month's trips, like the overview's Service delivered row.
    value: (entry) => {
      const { scheduled, dropped } = sumTrips([entry]);
      return scheduled >= MIN_SCHEDULED_TRIPS ? (100 * dropped) / scheduled : undefined;
    },
    format: formatDroppedPct,
    detail: (entry) => {
      const { scheduled, dropped } = sumTrips([entry]);
      return `${dropped.toLocaleString()} of ${scheduled.toLocaleString()} trips`;
    },
    order: 'descending',
    emptyMessage: `No route has ${MIN_SCHEDULED_TRIPS} scheduled trips counted for this period. Counts start Dec 24, 2025.`,
    note:
      "Estimated. A trip counts as dropped when it was scheduled but the MBTA's tracking data (LAMP) " +
      'recorded none of its stops, which also happens when a bus runs with its tracking off. Ranked ' +
      'by month, as over a week or a day the order is mostly chance. Routes with fewer than ' +
      `${MIN_SCHEDULED_TRIPS} scheduled trips aren't ranked.`,
    monthlyOnly: true,
    setAside: {
      test: (entry) => mayIncludeTrackingGaps(sumTrips([entry])),
      title: 'May include tracking gaps',
      description:
        'Few of these routes’ trips with no recorded stops have an MBTA waiver, so some may be ' +
        'buses that ran without tracking. They aren’t ranked with the others.',
    },
  },
];

export const DEFAULT_LEADERBOARD_METRIC: LeaderboardMetric = 'speed';

/**
 * Routes on the leaderboard's dwell summary must average at least this many stops with a dwell
 * per day of service. Below it, a route's average swings 3-8s from one weekday to the next
 * (October 2026), against about 1s for busier routes, so a handful of trips could top the list.
 * At 200 it leaves out 3 of 121 routes on a weekday, Route 55 (about 140 stops) among them.
 */
export const MIN_DWELL_STOPS_PER_DAY = 200;

/** How many routes each of the dwell summary's two lists shows. */
export const DWELL_SUMMARY_SIZE = 5;
