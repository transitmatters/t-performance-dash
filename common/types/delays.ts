import type { Line } from './lines';

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

/** A day or week of /api/linedelays. The per-cause fields add up the delay alerts stated. */
export type LineDelays = {
  date: string;
  line: Line;
  /** Delay the alerts stated ("delays of about 15 minutes"), summed. */
  total_delay_time: number;
  /** Subway only: minutes at least one of those alerts was up. Absent without alert history. */
  delay_alert_minutes?: number;
} & Record<DelayCause, number> &
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
