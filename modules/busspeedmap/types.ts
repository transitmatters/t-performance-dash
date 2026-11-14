import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';

/**
 * The six departure windows, plus `all_day`: not a seventh window but every traversal the six
 * cover, aggregated directly rather than combined from band medians. Its map features live in
 * an archive of their own (see busSpeedSegmentsPath).
 */
export type TimeBand =
  | 'early_am'
  | 'am_peak'
  | 'midday'
  | 'pm_peak'
  | 'evening'
  | 'late_night'
  | 'all_day';

export type DirectionFilter = 'inbound' | 'outbound';

/** What the map colours segments by: their speed, or their running time against light traffic. */
export type SegmentColorBy = 'speed' | 'delay';

/** Whether most of a segment's trips start on it or end on it. */
export type TerminalSection = 'first' | 'last';

/** Which published tileset to load: a single service date, an ISO week, or a calendar month. */
export type Period = 'daily' | 'weekly' | 'monthly';

/**
 * A daily file covers exactly one day, so it's inherently a single day type already and
 * carries no `day_type` property at all. Only weekly/monthly features have one, via MBTA's
 * own GTFS calendar -- `weekend_or_holiday` absorbs MBTA-observed holidays (e.g. a Monday
 * Christmas) into the weekend bucket, not just Sat/Sun.
 */
export type DayType = 'business_day' | 'weekend_or_holiday';

/**
 * What archives published before dwell moved to a layer of its own (mbta-performance#154) carry
 * in place of the running speeds. All arrival to arrival, so they count the time buses stood at
 * the from-stop: `median_dwell_seconds`, at `from_stop_id`. Each is missing from archives older
 * still, published before the pipeline started writing it. Read through segmentSpeed and its
 * siblings in utils.ts, which take the running speed where there is one.
 */
export interface ArrivalToArrivalSpeeds {
  p50_speed_mph?: number;
  p10_speed_mph?: number;
  p90_speed_mph?: number;
  p50_total_time_seconds?: number;
  median_dwell_seconds?: number;
  from_stop_id?: string;
}

/**
 * Properties read off a rendered vector-tile feature. Deliberately a small subset of the
 * GeoParquet schema (mbta-performance's pmtiles.TILE_PROPERTIES).
 *
 * The speeds are running speeds: from leaving the from-stop to reaching the to-stop, so the time
 * buses spend at stops is left out and drawn as a layer of its own (BusDwellProperties). LAMP's
 * stop times aren't taken at the stop itself, so that clock covers the segment less about 90m
 * around its stops (`running_length_m`), and `p50_running_speed_mph` is `running_length_m` over
 * `p50_running_time_seconds`. A segment under 125m (MIN_RUNNING_SPEED_SEGMENT_M) has none of the
 * three, and is drawn as no data. `segment_length_m` is the whole segment, stop to stop.
 *
 * `day_type` only exists on weekly/monthly features, where it's the true median across every
 * traversal of that (segment, day_type, time_band) in the whole period -- not an average of
 * daily numbers, so it reads as "typical", not "on this one day".
 *
 * `p10_running_speed_mph` and `p90_running_speed_mph` are the speeds of the fastest and slowest
 * tenth of trips, to show the range around the median. Only on features with at least 10 trips,
 * as "1 in 10" means nothing with fewer.
 *
 * `terminal_section` marks a segment most of whose trips start ("first") or end ("last") on it.
 * Those two read differently from the rest of a route: a trip's first segment leaves out its
 * layover, and its last runs slower. Missing everywhere else, and from older tiles.
 *
 * `shared_routes` is on every feature of a stop pair that two or more drawn routes share: their
 * route_ids, sorted and comma-joined ("749,751"). One more feature on the pair has that same
 * string as its route_id: the pooled one, the median of all their trips together (see
 * mbta-performance's shared_segments.py), drawn in place of each route's own line when every one
 * of them is selected. Missing everywhere else, and from tiles published before the pipeline
 * pooled them.
 *
 * `free_flow_running_time_seconds` is the segment's median running time when traffic is light:
 * trips that left before 6am or from 10pm, pooled over every day in the archive (mbta-performance's
 * free_flow_running_times). The map's delay colouring compares `p50_running_time_seconds` with it.
 * Missing where there were fewer than 10 such trips, and from archives published before the
 * pipeline started writing it (see fetchBusSpeedSegmentsHasFreeFlow).
 */
export interface BusSpeedSegmentProperties extends ArrivalToArrivalSpeeds {
  route_id: string;
  direction_id: number;
  from_stop_name: string;
  to_stop_name: string;
  time_band: TimeBand;
  day_type?: DayType;
  n_traversals: number;
  n_interpolated: number;
  segment_length_m?: number;
  p50_running_speed_mph?: number;
  p10_running_speed_mph?: number;
  p90_running_speed_mph?: number;
  running_length_m?: number;
  p50_running_time_seconds?: number;
  terminal_section?: TerminalSection;
  shared_routes?: string;
  free_flow_running_time_seconds?: number;
}

/**
 * A point from the dwell archive (mbta-performance's dwells.py): how long one route's buses stood
 * at one stop, going one way, in one time band (and, weekly and monthly, one day type). Measured
 * from arrival to departure as LAMP records them, which aren't taken at the stop itself, so it's
 * best read as time around the stop: slowing, standing and pulling out. A trip's first stop is
 * left out (that's layover), as are interpolated stop times.
 *
 * Each point sits where the stop falls on the route's own line rather than at the pole, which can
 * be across the street. `stop_id` matches the pole's in the stops reference archive. Dwell is
 * rounded to 5 seconds, the spacing of the vehicle positions behind LAMP's stop times.
 */
export interface BusDwellProperties {
  route_id: string;
  direction_id: number;
  stop_id: string;
  stop_name: string;
  time_band: TimeBand;
  day_type?: DayType;
  n_dwells: number;
  median_dwell_seconds: number;
  p90_dwell_seconds: number;
}

/**
 * One route's time at a stop, for the stop's popup: off the dwell archive, or, for an archive
 * published before there was one, off the segment leaving the stop. `p90_dwell_seconds` is only
 * on the former; `n_trips` is the dwells counted, or the segment's trips.
 */
export interface StopDwell {
  route_id: string;
  median_dwell_seconds: number;
  p90_dwell_seconds?: number;
  n_trips: number;
}

/**
 * A rapid transit parent station from the stops reference tileset. All strings: `lines` is
 * comma-joined with Green's branches collapsed ("Red,Green"); `routes` keeps them, in GTFS
 * route_sort_order ("Red,Green-B,Green-C").
 */
export interface StationProperties {
  stop_id: string;
  stop_name: string;
  lines: string;
  routes: string;
}

/** A bus stop pole from the stops reference tileset. `routes` is comma-joined route_ids. */
export interface BusStopProperties {
  stop_id: string;
  stop_name: string;
  routes: string;
}

export interface FetchBusSpeedSegmentsOptions {
  date: string | undefined;
  period: Period;
}

/**
 * The pmtiles archive, unlike leaderboard.json, is split by time band: the six bands share one
 * file and `all_day` has its own, so the band decides which URL to load.
 */
export interface FetchBusSpeedSegmentsUrlOptions extends FetchBusSpeedSegmentsOptions {
  timeBand: TimeBand;
}

/**
 * A leaderboard row -- a narrower cut of BusSpeedSegmentProperties with no stop_id or
 * geometry. `time_band`/`day_type` aren't repeated per row: they're the key you looked the
 * row array up under (see BusSpeedSegmentLeaderboardResponse), same as they're absent from
 * daily pmtiles features. Already sorted slowest-first and capped server-side.
 *
 * Ranked by running speed, the same speed the map draws, so a segment too short to have one is
 * left off. Files published before that rank by the arrival-to-arrival `p50_speed_mph` instead,
 * which is `segment_length_m` over `p50_total_time_seconds` (see ArrivalToArrivalSpeeds).
 */
export interface BusSpeedSegmentLeaderboardEntry extends Pick<
  ArrivalToArrivalSpeeds,
  'p50_speed_mph' | 'p50_total_time_seconds'
> {
  route_id: string;
  direction_id: number;
  from_stop_name: string;
  to_stop_name: string;
  p50_running_speed_mph?: number;
  n_traversals: number;
  n_interpolated: number;
  segment_length_m?: number;
  running_length_m?: number;
  p50_running_time_seconds?: number;
}

/** A daily leaderboard file, keyed straight by time_band. */
export type BusSpeedSegmentLeaderboardByBand = Partial<
  Record<TimeBand, BusSpeedSegmentLeaderboardEntry[]>
>;

/**
 * A weekly/monthly leaderboard file, nested one level deeper by day_type first. A
 * still-in-progress week/month can be missing a day_type key entirely if no matching day has
 * happened yet.
 */
export type BusSpeedSegmentLeaderboardByDayType = Partial<
  Record<DayType, BusSpeedSegmentLeaderboardByBand>
>;

export type BusSpeedSegmentLeaderboardResponse =
  | BusSpeedSegmentLeaderboardByBand
  | BusSpeedSegmentLeaderboardByDayType;

/**
 * Which grain the merged leaderboard page ranks by -- routes (an arbitrary date range, summed
 * across the whole thing) or segments (one precomputed day/week/month slice). Both share the
 * same period control, but only 'route' mode ever cares about frequentRoutesOnly, and only
 * 'segment' mode cares about day type/time band.
 */
export type LeaderboardViewMode = 'route' | 'segment';

/**
 * What the route leaderboard ranks by. Only speed has a segment view; the rest are per route.
 */
export type LeaderboardMetric = 'speed' | 'battery' | 'bunched' | 'reliability' | 'dropped';

export interface LeaderboardMetricConfig {
  key: LeaderboardMetric;
  /** The Rank by option. */
  label: string;
  /** The list's heading. */
  title: string;
  /** Said under the heading, after the period. */
  rankedBy: string;
  /** The route's figure, or undefined to leave the route off the list. */
  value: (entry: BusSpeedLeaderboardEntry) => number | undefined;
  format: (value: number) => string;
  /** What the figure comes from, shown beside it, such as "12 of 1,400 trips". */
  detail?: (entry: BusSpeedLeaderboardEntry) => string;
  /** Which end of the list comes first: the slowest, most bunched, least reliable or most dropped, but the highest battery share. */
  order: 'ascending' | 'descending';
  /** Shown when the data has routes but this metric lists none of them. */
  emptyMessage: string;
  /** Said under the list: how the figure is counted, and which routes it leaves out. */
  note?: string;
  /**
   * Ranks Frequent Bus Routes only, so the Frequent toggle is hidden. Headways suit routes riders turn
   * up for without a schedule.
   */
  frequentOnly?: boolean;
  /** Ranks whole months only, so the period control is hidden. */
  monthlyOnly?: boolean;
  /**
   * Routes whose figure is in doubt. They're listed below the ranking, under `title`, rather than
   * ranked against the rest.
   */
  setAside?: {
    test: (entry: BusSpeedLeaderboardEntry) => boolean;
    title: string;
    description: string;
  };
}
