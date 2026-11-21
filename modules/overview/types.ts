export type DeltaSentiment = 'good' | 'bad' | 'flat';

export type MetricKey = 'speed' | 'service' | 'slowzones' | 'ridership' | 'delays' | 'reliability';

export interface ScorecardRow {
  key: MetricKey;
  label: string;
  subtitle: string;
  formattedCurrent: string;
  currentValue: number;
  formatValue: (value: number) => string;
  unit: string;
  deltaLabel: string;
  deltaValueLabel: string;
  deltaSentiment: DeltaSentiment;
  trend: number[];
  color: string;
  /** Change from the same 30 days a year earlier. Only on rows built with it (bus ridership). */
  yearOverYear?: {
    label: string;
    shortLabel: string;
    sentiment: DeltaSentiment;
  };
  /** The 30-day figure as a share of the historical peak, e.g. "74% of peak". */
  peakLabel?: string;
}

export type SlotStatus = 'loading' | 'error' | 'empty' | 'ready';

/** A scorecard row's place in the table, which it keeps while its data loads, fails or is missing. */
export interface ScorecardSlot {
  key: MetricKey;
  label: string;
  subtitle: string;
  status: SlotStatus;
  /** Set when status is 'ready' */
  row?: ScorecardRow;
  /** Refetches the failed queries. Set when status is 'error'. */
  retry?: () => void;
  isRetrying?: boolean;
}
