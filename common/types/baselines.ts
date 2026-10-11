// Shape of static/landing/baselines.json, published weekly by data-ingestion.
export type BaselineMetric = 'speed' | 'service' | 'scheduledService' | 'ridership';

export interface BaselineSeries {
  // null when there isn't enough history, or the baseline is held back pending a decision
  value: number | null;
  bestWindow: { start: string; end: string; weeksWithData: number } | null;
  /** The weeks searched for the best window; `start` is after `end` when none are old enough. */
  historyWindow?: { start: string; end: string };
  historyWeeks?: number;
  prePandemicHistory?: boolean;
  insufficientHistory?: boolean;
  /** What `value` would be if it weren't held back. */
  candidateValue?: number;
  /** A key into `HistoricalBaselines.heldBackReasons`. */
  heldBack?: string;
}

export interface HistoricalBaselines {
  schemaVersion: 1;
  generatedAt: string;
  definition?: string;
  cutoff: string;
  lookbackYears?: number;
  minHistoryWeeks?: number;
  heldBackReasons?: Record<string, string>;
  metrics: {
    [metric in BaselineMetric]?: {
      unit: string;
      series: Record<string, BaselineSeries>;
    };
  };
}
