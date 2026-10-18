import type { BaselineMetric, HistoricalBaselines } from '../types/baselines';
import type { Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

/** Published historical best for a series, or `fallback` (the hard-coded peak) when there isn't one. */
export const getBaseline = (
  baselines: HistoricalBaselines | null | undefined,
  metric: BaselineMetric,
  seriesId: string | undefined,
  fallback: number
): number => {
  const value = seriesId ? baselines?.metrics[metric]?.series[seriesId]?.value : undefined;
  return typeof value === 'number' && value > 0 ? value : fallback;
};

// Scheduled service and ridership series use GTFS-style line ids ('line-Red'); speed uses ours ('line-red').
export const lineSeriesId = (line: Line | undefined): string | undefined =>
  line ? (RIDERSHIP_KEYS[line] ?? line) : undefined;
