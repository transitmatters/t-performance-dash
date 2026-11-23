import type { Schemas } from './apiSchemas';

export const DELAY_CAUSES = [
  'disabled_vehicle',
  'door_problem',
  'power_problem',
  'signal_problem',
  'switch_problem',
  'brake_problem',
  'track_issue',
  'track_work',
  'car_traffic',
  'mechanical_problem',
  'flooding',
  'police_activity',
  'medical_emergency',
  'fire',
  'other',
] as const;

export type DelayCause = (typeof DELAY_CAUSES)[number];

/**
 * A day or week of /api/linedelays. The per-cause fields add up the delay alerts stated.
 * `delay_alert_minutes` (subway only) is absent without alert history.
 * `line` is the route the delays are for, as requested: `Red`, `Green-B`, `CR-Fairmount`.
 */
export type LineDelays = Schemas['LineDelayEntry'] & {
  delay_alert_minutes?: number;
} & Record<DelayCause, number> &
  // The per-cause minutes are extra keys the spec doesn't list.
  Partial<Record<`delay_alert_minutes_${DelayCause}`, number>>;

/**
 * What the delay charts plot: the actual delay (time alerts were active) when the line has
 * it, otherwise the stated delay. `total_delay_time` is null for a row missing the actual
 * delay (e.g. today, before alert history is in), so it shows as a gap rather than mixing in
 * the stated number.
 */
export type DisplayedDelays = {
  date: string;
  total_delay_time: number | null;
  stated_delay_time: number;
} & Record<DelayCause, number>;
