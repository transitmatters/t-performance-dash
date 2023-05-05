import type { SpeedDataPoint } from '../../../common/types/dataPoints';

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
