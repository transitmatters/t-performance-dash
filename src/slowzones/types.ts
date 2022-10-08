import { Moment } from 'moment';

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
  order: number;
}

export interface Day {
  date: string;
  Blue: number;
  Orange: number;
  Red: number;
  Green: number;
}

export type Direction = 'northbound' | 'southbound';

export type ChartView = 'line' | 'xrange';

export type MbtaEventType = 'derailment' | 'shutdown';

export interface MbtaMajorEvent {
  start: string;
  end: string;
  color: string;
  title: string;
  description: string;
  type: MbtaEventType;
}
