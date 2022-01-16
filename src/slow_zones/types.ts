export interface SlowZone {
  service_date: number;
  start: Date;
  end: Date;
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
}

export type ChartView = "line" | "xrange";
