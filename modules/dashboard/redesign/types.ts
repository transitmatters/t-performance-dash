export type DeltaSentiment = 'good' | 'bad' | 'flat';

export type MetricKey = 'speed' | 'service' | 'slowzones' | 'ridership';

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
}
