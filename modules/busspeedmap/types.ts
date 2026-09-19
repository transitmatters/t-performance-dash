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
