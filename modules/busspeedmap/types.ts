export type TimeBand = 'early_am' | 'am_peak' | 'midday' | 'pm_peak' | 'evening' | 'late_night';

/**
 * Properties read off a rendered vector-tile feature. Deliberately a small subset of the
 * GeoParquet schema: `p50_speed_mph` is arrival-to-arrival and includes dwell at the
 * from-stop, which is what a rider actually experiences. The moving-speed and p90 columns
 * should never be baked into the tileset, so they cannot end up on the map by accident.
 */
export interface BusSpeedSegmentProperties {
  route_id: string;
  direction_id: number;
  from_stop_name: string;
  to_stop_name: string;
  time_band: TimeBand;
  p50_speed_mph: number;
  n_traversals: number;
  n_interpolated: number;
}

export interface FetchBusSpeedSegmentsOptions {
  date: string | undefined;
}
