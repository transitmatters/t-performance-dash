// Shape of static/landing/baselines.json, published weekly by data-ingestion.
export type BaselineMetric = 'speed' | 'service' | 'scheduledService' | 'ridership';

export interface BaselineSeries {
  // null when there isn't enough history, or the baseline is held back pending a decision
  value: number | null;
  bestWindow: { start: string; end: string; weeksWithData: number } | null;
  heldBack?: string;
}

export interface HistoricalBaselines {
  schemaVersion: 1;
  generatedAt: string;
  cutoff: string;
  metrics: {
    [metric in BaselineMetric]?: {
      unit: string;
      series: Record<string, BaselineSeries>;
    };
  };
}
