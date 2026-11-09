export type DeltaSentiment = 'good' | 'bad' | 'flat';

export type MetricKey = 'speed' | 'service' | 'slowzones' | 'ridership' | 'delays';

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
