import { Moment } from "moment";

export interface SlowZone {
  service_date: number;
  start: Moment;
  end: Moment;
  mean_metric: number;
  duration: number;
  baseline: number;
  delay: number;
  color: string;
  fr_id: number;
  to_id: number;
  from: string;
  to: string;
  uuid: number;
  id: string;
  from_short: string;
  to_short: string;
  direction: Direction;
}

export type Direction = "northbound" | "southbound";

export type ChartView = "line" | "xrange";
