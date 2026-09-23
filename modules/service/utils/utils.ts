import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';

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
  peakService: number
) => {
  const scheduled = data.map((datapoint, index) => {
    return datapoint.miles_covered && predictedData.counts[index]
      ? (100 * datapoint.count) / (predictedData.counts[index].count / 2)
      : Number.NaN;
  });
  const peak = data.map((datapoint) =>
    datapoint.miles_covered ? (100 * datapoint.count) / peakService : Number.NaN
  );
  return { scheduled: scheduled, peak };
};

export const getAverageWithNaNs = (data: number[]) => {
  const removeNaNs = data.filter((datapoint) => !isNaN(datapoint));
  return removeNaNs.reduce((sum, count) => sum + count, 0) / removeNaNs.length / 100;
};
