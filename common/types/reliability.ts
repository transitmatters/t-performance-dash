import type { Line } from './lines';

export interface LineDelays {
  date: string;
  disabled_train: number;
  door_problem: number;
  flooding: number;
  fire: number;
  line: Line;
  medical_emergency: number;
  other: number;
  police_activity: number;
  power_problem: number;
  signal_problem: number;
  brake_problem: number;
  switch_problem: number;
  total_delay_time: number;
  track_issue: number;
}
