import { PEAK_SCHEDULED_SERVICE } from '../../../common/constants/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';

export const getServiceWidgetValues = (
  deliveredTripMetrics: DeliveredTripMetrics[],
  predictedData: ScheduledService
) => {
  const totals = deliveredTripMetrics.reduce(
    (totals, datapoint, index) => {
      const predictedDatapoint = predictedData.counts[index];
      if (datapoint.count && predictedDatapoint?.count) {
        return {
          actual: totals.actual + datapoint.count,
          scheduled: totals.scheduled + predictedDatapoint.count,
        };
      }
      return { actual: totals.actual, scheduled: totals.scheduled };
    },
    { actual: 0, scheduled: 0 }
  );
  const percentDelivered = totals.actual / totals.scheduled;
  const datapointsCount = deliveredTripMetrics.filter(
    (datapoint) => datapoint.miles_covered
  ).length;
  const current = deliveredTripMetrics[deliveredTripMetrics.length - 1].count;
  const delta = current - deliveredTripMetrics[0].count;
  const average =
    deliveredTripMetrics.reduce((sum, speed) => sum + speed.count, 0) / datapointsCount;
  const peak = deliveredTripMetrics.reduce(
    (max, speed) => (speed.count > max.count ? speed : max),
    deliveredTripMetrics[0]
  );
  return { current, delta, average, peak, percentDelivered };
};

export const getPercentageData = (
  data: DeliveredTripMetrics[],
  predictedData: ScheduledService,
  line?: Line
) => {
  const scheduled = data.map((datapoint, index) => {
    return datapoint.miles_covered && predictedData.counts[index]
      ? (100 * datapoint.count) / (predictedData.counts[index].count / 2)
      : Number.NaN;
  });
  const peak = data.map((datapoint) =>
    datapoint.miles_covered
      ? (100 * datapoint.count) / PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']
      : Number.NaN
  );
  return { scheduled: scheduled, peak };
};

export const getAverageWithNaNs = (data: number[]) => {
  const removeNaNs = data.filter((datapoint) => !isNaN(datapoint));
  return removeNaNs.reduce((sum, count) => sum + count, 0) / removeNaNs.length / 100;
};

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

/**
 * Headline KPIs for the Service page's summary cards, derived entirely from data already fetched
 * for the charts (no extra requests). Deltas are trailing-vs-leading half of the selected range —
 * a "trending up/down over this window" signal, not a fresh query.
 */
export const getServiceStats = (
  data: DeliveredTripMetrics[],
  predictedData: ScheduledService,
  line?: Line
) => {
  const counts = data.filter((d) => d.miles_covered).map((d) => d.count);
  const [c1, c2] = halves(counts);
  const peak = data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

  // Per-day % delivered, same basis as the Service-delivered chart (getPercentageData / 100).
  const pct = getPercentageData(data, predictedData, line).scheduled.filter((v) => !isNaN(v));
  const [p1, p2] = halves(pct);

  return {
    avgRoundTrips: mean(counts),
    roundTripsDelta: mean(c2) - mean(c1),
    percentDelivered: mean(pct) / 100,
    percentDeliveredDelta: (mean(p2) - mean(p1)) / 100,
    peakCount: peak?.count,
    peakDate: peak?.date,
  };
};
