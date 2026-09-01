export type DeltaSentiment = 'good' | 'bad' | 'flat';

export type MetricKey = 'speed' | 'service' | 'slowzones' | 'ridership';

export interface ScorecardRow {
  key: MetricKey;
  label: string;
  subtitle: string;
  formattedCurrent: string;
  unit: string;
  benchmarkLabel: string;
  percentOfBenchmark: number | null;
  deltaLabel: string;
  deltaSentiment: DeltaSentiment;
  trend: number[];
  color: string;
}
