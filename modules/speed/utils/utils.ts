import { PEAK_SPEED } from '../../../common/constants/baselines';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

/**
 * Headline KPIs for the Speed page's summary cards, derived entirely from data already fetched
 * for the chart (no extra requests). Deltas are trailing-vs-leading half of the selected range —
 * a "trending up/down over this window" signal, not a fresh query.
 */
export const getSpeedStats = (data: DeliveredTripMetrics[], line?: Line) => {
  const mphs = data
    .filter((d) => d.miles_covered)
    .map((d) => d.miles_covered / (d.total_time / 3600))
    .filter((mph) => Number.isFinite(mph));
  const [m1, m2] = halves(mphs);
  const avgSpeed = mean(mphs);
  const peakSpeed = mphs.length ? Math.max(...mphs) : NaN;
  const historicalMax = PEAK_SPEED[line ?? 'DEFAULT'];

  return {
    avgSpeed,
    avgSpeedDelta: mean(m2) - mean(m1),
    peakSpeed,
    percentOfMax: historicalMax ? avgSpeed / historicalMax : NaN,
    percentOfMaxDelta: historicalMax ? (mean(m2) - mean(m1)) / historicalMax : NaN,
  };
};
