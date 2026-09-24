export type TimeBand = 'early_am' | 'am_peak' | 'midday' | 'pm_peak' | 'evening' | 'late_night';

export type DirectionFilter = 'inbound' | 'outbound';

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
 * Properties read off a rendered vector-tile feature. Deliberately a small subset of the
 * GeoParquet schema: `p50_speed_mph` is arrival-to-arrival and includes dwell at the
 * from-stop, which is what a rider actually experiences. The moving-speed and p90 columns
 * should never be baked into the tileset, so they cannot end up on the map by accident.
 *
 * `day_type` only exists on weekly/monthly features, where it's the true median across every
 * traversal of that (segment, day_type, time_band) in the whole period -- not an average of
 * daily numbers, so it reads as "typical", not "on this one day".
 */
export interface BusSpeedSegmentProperties {
  route_id: string;
  direction_id: number;
  from_stop_name: string;
  to_stop_name: string;
  time_band: TimeBand;
  day_type?: DayType;
  p50_speed_mph: number;
  n_traversals: number;
  n_interpolated: number;
}

export interface FetchBusSpeedSegmentsOptions {
  date: string | undefined;
  period: Period;
}

/**
 * A leaderboard row -- a narrower cut of BusSpeedSegmentProperties with no stop_id or
 * geometry. `time_band`/`day_type` aren't repeated per row: they're the key you looked the
 * row array up under (see BusSpeedSegmentLeaderboardResponse), same as they're absent from
 * daily pmtiles features. Already sorted slowest-first and capped server-side.
 */
export interface BusSpeedSegmentLeaderboardEntry {
  route_id: string;
  direction_id: number;
  from_stop_name: string;
  to_stop_name: string;
  p50_speed_mph: number;
  n_traversals: number;
  n_interpolated: number;
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
  BusSpeedSegmentLeaderboardByBand | BusSpeedSegmentLeaderboardByDayType;

/**
 * Which grain the merged leaderboard page ranks by -- routes (an arbitrary date range, summed
 * across the whole thing) or segments (one precomputed day/week/month slice). Both share the
 * same period control, but only 'route' mode ever cares about keyRoutesOnly, and only
 * 'segment' mode cares about day type/time band.
 */
export type LeaderboardViewMode = 'route' | 'segment';
