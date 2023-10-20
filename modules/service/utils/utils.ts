import { PEAK_SCHEDULED_SERVICE } from '../../../common/constants/baselines';
import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';

export const getServiceWidgetValues = (
  deliveredTripMetrics: DeliveredTripMetrics[],
  predictedData: number[]
) => {
  const totals = deliveredTripMetrics.reduce(
    (totals, datapoint, index) => {
      if (datapoint.count && predictedData[index]) {
        return {
          actual: totals.actual + datapoint.count,
          scheduled: totals.scheduled + predictedData[index],
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
      ? (100 * datapoint.count) / (predictedData.counts[index] / 2)
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
