import { PEAK_SCHEDULED_SERVICE } from '../../../common/constants/baselines';
import type { SpeedDataPoint, TripCounts } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';

export const getServiceWidgetValues = (datapoints: SpeedDataPoint[], predictedData: number[]) => {
  const totals = datapoints.reduce(
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
  const datapointsCount = datapoints.filter((datapoint) => datapoint.value !== null).length;
  const current = datapoints[datapoints.length - 1].count / 2;
  const delta = current - datapoints[0].count / 2;
  const average = datapoints.reduce((sum, speed) => sum + speed.count, 0) / datapointsCount / 2;
  const peak = datapoints.reduce(
    (max, speed) => (speed.count > max.count ? speed : max),
    datapoints[0]
  );
  return { current, delta, average, peak, percentDelivered };
};

export const getPercentageData = (
  data: SpeedDataPoint[],
  predictedData: TripCounts,
  line?: Line
) => {
  const scheduled = data.map((datapoint, index) => {
    return datapoint.value && predictedData.counts[index]
      ? (100 * datapoint.count) / predictedData.counts[index]
      : Number.NaN;
  });
  const baseline = data.map((datapoint) =>
    datapoint.value
      ? (100 * datapoint.count) / 2 / PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']
      : Number.NaN
  );
  return { scheduled: scheduled, baseline: baseline };
};

export const getAverageWithNaNs = (data: number[]) => {
  const removeNaNs = data.filter((datapoint) => !isNaN(datapoint));
  return removeNaNs.reduce((sum, count) => sum + count, 0) / removeNaNs.length / 100;
};
