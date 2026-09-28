import type { Line } from '../../common/types/lines';

// Shaped like the planned static/landing/home.json (schemaVersion 1) so the page can switch from
// building this in the browser to fetching it once data-ingestion publishes it.

export type MetricId = 'service' | 'frequency' | 'speed' | 'slowZones' | 'ridership' | 'fleet';

/** `insufficient`: should be measured but there isn't enough recent data. `na`: not measured. */
export type Status = 'win' | 'good' | 'room' | 'problem' | 'insufficient' | 'na';

export type Direction = 'higher' | 'lower';

/** `count` is a raw count described by `Cell.unitLabel`, e.g. riders per weekday. */
export type Unit = 'pct' | 'mph' | 'seconds' | 'years' | 'count';

export interface Cell {
  metric: MetricId;
  status: Status;
  /** The number the status is judged on: a ratio to the baseline or goal, or a raw value. */
  score: number | null;
  /** The headline figure shown to riders, in `unit`. */
  value: number | null;
  unit: Unit;
  unitLabel?: string;
  /** What `value` is compared against, e.g. "Best: 24.9 mph (Oct 2019)". */
  baselineLabel?: string;
  /** Last 2 weeks vs the 12-week window, as a fraction (0.05 = 5% higher). */
  trend: number | null;
  /** `yearAgo`: `trend` is the change in score since the schedule a year ago, in points. */
  trendBasis?: 'yearAgo';
  secondary?: string;
  spark?: number[];
  asOf?: string;
  notes?: string[];
  href?: string;
}

export type HeadlineKind = 'strong' | 'good' | 'room' | 'needsWork' | 'limited';

export interface Headline {
  kind: HeadlineKind;
  /** Cells holding the row back, worst first. */
  heldBackBy: MetricId[];
}

export interface Row {
  id: string;
  label: string;
  group: 'core' | 'also';
  /** Drives the `[data-line]` color tokens. */
  line: Line;
  href: string;
  headline: Headline;
  cells: Record<MetricId, Cell>;
}

export interface HeroStat {
  id: string;
  label: string;
  value: number | null;
  unit: Unit | 'minutes';
  detail?: string;
  trend?: number | null;
  direction: Direction;
}

export type FactKind = 'win' | 'issue';

export interface Fact {
  kind: FactKind;
  rowId: string;
  metric: MetricId;
  /** Template key; copy lives in copy.ts. */
  key: 'status' | 'trend';
  score: number;
}

export interface HomeData {
  schemaVersion: 1;
  generatedAt: string;
  rows: Row[];
  hero: HeroStat[];
  facts: { wins: Fact[]; issues: Fact[] };
}
