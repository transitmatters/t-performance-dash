import type { AggregateDataPoint, AggregateDataResponse } from './charts';

/** The `vs` URL param on multi-day trips: a preset, or the start date (YYYY-MM-DD) of a custom period. */
export type ComparePreset = 'previous' | 'year';
export type CompareOption = 'off' | ComparePreset | 'custom';

/** A second date range, the same length as the selected one, to compare against. */
export interface ComparisonPeriod {
  option: Exclude<CompareOption, 'off'>;
  startDate: string;
  endDate: string;
  /** Days to add to a comparison date to place it on the selected range's axis. */
  offsetDays: number;
  /** The comparison dates, e.g. "Sep 2 – Nov 1, 2025". */
  rangeLabel: string;
  /** Reads after "than", e.g. "the same weeks last year (Sep 2 – Nov 1, 2025)". */
  description: string;
}

/** One chart's comparison data. Undefined data with isError false means it is still loading. */
export interface TripComparison {
  period: ComparisonPeriod;
  data: AggregateDataResponse | undefined;
  isError: boolean;
}

/** A comparison period's median, drawn as a dashed line over an aggregate chart. */
export interface AggregateComparisonSeries {
  data: AggregateDataPoint[];
  label: string;
  /** Days added to each comparison date so both periods share the x axis. 0 for by-hour charts. */
  offsetDays: number;
  status: 'loading' | 'error' | 'ready';
}
