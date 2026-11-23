import type { PeakRidershipKey } from '../constants/baselines';
import { PEAK_RIDERSHIP } from '../constants/baselines';
import type { BaselineMetric, HistoricalBaselines } from '../types/baselines';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../types/lines';
import { RIDERSHIP_KEYS } from '../types/lines';

/**
 * Published historical best for a series, or `fallback` (the hard-coded peak) when baselines.json
 * didn't load or has no value for the series. A series it holds back gets `heldBackFallback`, by
 * default none: the reasons a series is held back (COVID-era history, seasonal service) usually
 * make a hard-coded peak just as misleading (#1605).
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

/**
 * The hard-coded peak a ridership baseline falls back on, by bus route, Commuter Rail line, ferry
 * route or line. None for Commuter Rail or ferries (see PeakRidershipKey), even when
 * baselines.json doesn't load.
 */
export const ridershipFallbackPeak = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
): number | undefined => {
  if (crRoute || ferryRoute || line === 'line-commuter-rail' || line === 'line-ferry') {
    return undefined;
  }
  const key = (busRoute ? busRoute.replaceAll('/', '') : line) as PeakRidershipKey | undefined;
  return PEAK_RIDERSHIP[key ?? 'DEFAULT'];
};
