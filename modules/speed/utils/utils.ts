import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

/** Total miles over total hours, so a partial week or a holiday counts for only the trips it ran. */
const weightedMph = (rows: DeliveredTripMetrics[]) => {
  const miles = rows.reduce((sum, d) => sum + d.miles_covered, 0);
  const hours = rows.reduce((sum, d) => sum + d.total_time, 0) / 3600;
  return hours ? miles / hours : NaN;
};

/**
 * Headline KPIs for the Speed page's summary cards, derived entirely from data already fetched
 * for the chart (no extra requests). Deltas are trailing-vs-leading half of the selected range —
 * a "trending up/down over this window" signal, not a fresh query. `historicalMax` should be the
 * same baseline the chart draws, so the card and the hover agree.
 */
export const getSpeedStats = (data: DeliveredTripMetrics[], historicalMax: number) => {
  const rows = data.filter((d) => d.miles_covered && d.total_time);
  const mphs = rows
    .map((d) => d.miles_covered / (d.total_time / 3600))
    .filter((mph) => Number.isFinite(mph));
  const [h1, h2] = halves(rows);
  const avgSpeed = weightedMph(rows);
  const avgSpeedBefore = weightedMph(h1);
  const avgSpeedAfter = weightedMph(h2);
  const peakSpeed = mphs.length ? Math.max(...mphs) : NaN;
  const share = (mph: number) => (historicalMax ? mph / historicalMax : NaN);

  return {
    avgSpeed,
    avgSpeedDelta: avgSpeedAfter - avgSpeedBefore,
    avgSpeedBefore,
    avgSpeedAfter,
    peakSpeed,
    percentOfMax: share(avgSpeed),
    percentOfMaxDelta: share(avgSpeedAfter - avgSpeedBefore),
    percentOfMaxBefore: share(avgSpeedBefore),
    percentOfMaxAfter: share(avgSpeedAfter),
  };
};
