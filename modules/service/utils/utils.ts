import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';
import type { AggType } from '../../speed/constants/speeds';

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

// Monthly trip metrics are dated the first of the month but scheduled service the last,
// and the two series can start in different months, so match them by period, not index.
const getPeriodKey = (date: string, agg: AggType) => (agg === 'monthly' ? date.slice(0, 7) : date);

export const getPercentageData = (
  data: DeliveredTripMetrics[],
  predictedData: ScheduledService,
  peakService: number,
  agg: AggType
) => {
  const scheduledByPeriod = new Map(
    predictedData.counts.map(({ date, count }) => [getPeriodKey(date, agg), count])
  );
  const scheduled = data.map((datapoint) => {
    const scheduledCount = scheduledByPeriod.get(getPeriodKey(datapoint.date, agg));
    return datapoint.miles_covered && scheduledCount
      ? (100 * datapoint.count) / (scheduledCount / 2)
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
