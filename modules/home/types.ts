import type { DelayCause } from '../../common/types/delays';
import type { Line } from '../../common/types/lines';

// The shape of static/landing/overview.json (schemaVersion 1), built daily by data-ingestion
// (chalicelib/overview).

export type MetricId = 'service' | 'dropped' | 'reliability' | 'delays' | 'speed' | 'ridership';

/**
 * `insufficient`: should be measured but there isn't enough recent data. `na`: not measured.
 * `unscored`: measured but never judged, like ridership.
 */
export type Status = 'win' | 'good' | 'room' | 'problem' | 'insufficient' | 'na' | 'unscored';

export type Direction = 'higher' | 'lower';

/** `count` is a raw count described by `Cell.unitLabel`, e.g. trips per day. */
export type Unit = 'pct' | 'mph' | 'seconds' | 'years' | 'count';

/** One of the measures a cell is judged on; the cell takes the worst of its parts' statuses. */
export interface CellPart {
  /** Stable key, e.g. `speed` or `slowZones`; `label` is display copy. */
  id?: string;
  label: string;
  status: Status;
  /** Shown as the figure, in `scoreUnit`. */
  score: number | null;
  scoreUnit: Unit;
  /** Follows the figure, e.g. "of best" or "a day". */
  unitLabel?: string;
  direction?: Direction;
  thresholds?: [number, number, number];
  href?: string;
}

export interface Cell {
  metric: MetricId;
  status: Status;
  /** The number the status is judged on: a ratio to the baseline or goal, or a raw value. */
  score: number | null;
  /** The headline figure shown to riders, in `unit`. */
  value: number | null;
  unit: Unit;
  unitLabel?: string;
  /** How `score` is judged: set on every cell with a status other than `na`. */
  direction?: Direction;
  /** Cut-offs for win / good / room on `score`; anything worse is a problem. */
  thresholds?: [number, number, number];
  /** The unit of `score` and `thresholds`, which can differ from `unit` (e.g. speed in mph). */
  scoreUnit?: Unit;
  /** What `value` is compared against, e.g. "Best: 24.9 mph (Oct 2019)". */
  baselineLabel?: string;
  /** Last 2 weeks vs the 12-week window, as a fraction (0.05 = 5% higher). */
  trend: number | null;
  /** `yearAgo`: `trend` is the change in score since the same weeks a year ago, in points. */
  trendBasis?: 'yearAgo';
  secondary?: string;
  spark?: number[];
  asOf?: string;
  notes?: string[];
  href?: string;
  /** Set when the status combines several measures, e.g. speed and slow zones. */
  parts?: CellPart[];
  /** Delays: minutes a day under a delay alert (per route when several pool together). */
  minutesPerDay?: number;
  /** Reliability: share of headways half the scheduled gap or less. */
  bunched?: number;
  /**
   * Delays: the cause with the most alert time over the last 4 weeks, leaving out alerts that give
   * no reason, and its share of all the alert time.
   */
  topCause?: { cause: DelayCause; share: number };
}

export type HeadlineKind = 'strong' | 'good' | 'room' | 'needsWork' | 'limited';

export interface Headline {
  kind: HeadlineKind;
  /** Cells holding the row back, worst first. An older file can list measures the page dropped. */
  heldBackBy: string[];
}

export interface Row {
  id: string;
  label: string;
  /** Drives the `[data-line]` color tokens. */
  line: Line;
  href: string;
  headline: Headline;
  /** Missing in a file built before a metric was added. */
  cells: Partial<Record<MetricId, Cell>>;
}

export interface HeroStat {
  id: string;
  label: string;
  value: number | null;
  unit: Unit | 'minutes';
  detail?: string;
  trend?: number | null;
  note?: string;
  direction: Direction;
  /** Slow zones: monthly means of minutes a day, as [YYYY-MM, minutes], oldest first. */
  history?: [string, number][];
}

export interface HomeData {
  schemaVersion: 1;
  generatedAt: string;
  rows: Row[];
  hero: HeroStat[];
}
