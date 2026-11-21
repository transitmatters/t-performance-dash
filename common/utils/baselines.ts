import type { BaselineMetric, HistoricalBaselines } from '../types/baselines';
import type { Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

/**
 * Published historical best for a series, or `fallback` (the hard-coded peak) when baselines.json
 * didn't load or has no value for the series. A series it holds back gets `heldBackFallback`, by
 * default none: Commuter Rail and ferry ridership are held back for reasons (COVID-era history,
 * seasonal service) that make their hard-coded peaks just as misleading (#1605).
 */
export const getBaseline = <
  Fallback extends number | undefined,
  HeldBackFallback extends number | undefined = undefined,
>(
  baselines: HistoricalBaselines | null | undefined,
  metric: BaselineMetric,
  seriesId: string | undefined,
  fallback: Fallback,
  heldBackFallback?: HeldBackFallback
): number | Fallback | HeldBackFallback => {
  const series = seriesId ? baselines?.metrics[metric]?.series[seriesId] : undefined;
  if (typeof series?.value === 'number' && series.value > 0) return series.value;
  return series?.heldBack ? (heldBackFallback as HeldBackFallback) : fallback;
};

// Scheduled service and ridership series use GTFS-style line ids ('line-Red'); speed uses ours ('line-red').
export const lineSeriesId = (line: Line | undefined): string | undefined =>
  line ? (RIDERSHIP_KEYS[line] ?? line) : undefined;
