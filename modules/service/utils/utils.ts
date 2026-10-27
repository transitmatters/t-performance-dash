import type { DeliveredTripMetrics, ScheduledService } from '../../../common/types/dataPoints';
import type { AggType } from '../../speed/constants/speeds';

// Monthly trip metrics are dated the first of the month but scheduled service the last,
// and the two series can start in different months, so match them by period, not index.
const getPeriodKey = (date: string, agg: AggType) => (agg === 'monthly' ? date.slice(0, 7) : date);

/** Scheduled and delivered round trips per period, dated like the delivered trip metrics. */
export const getScheduledAndDeliveredRoundTrips = (
  data: DeliveredTripMetrics[],
  predictedData: ScheduledService,
  agg: AggType
) => {
  const scheduledByPeriod = new Map(
    predictedData.counts.map(({ date, count }) => [getPeriodKey(date, agg), count])
  );
  const deliveredByPeriod = new Map(
    data.map((datapoint) => [getPeriodKey(datapoint.date, agg), datapoint])
  );
  const periods = [...new Set([...deliveredByPeriod.keys(), ...scheduledByPeriod.keys()])].sort();

  return periods.map((period) => {
    const delivered = deliveredByPeriod.get(period);
    const scheduledCount = scheduledByPeriod.get(period);
    const anyDelivered = !!delivered?.miles_covered;
    return {
      date: delivered?.date ?? (agg === 'monthly' ? `${period}-01` : period),
      scheduled: scheduledCount && anyDelivered ? Math.round(scheduledCount) / 2 : 0,
      delivered: anyDelivered ? Math.round(delivered.count) : 0,
    };
  });
};

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
  peakService: number,
  agg: AggType
) => {
  const counts = data.filter((d) => d.miles_covered).map((d) => d.count);
  const [c1, c2] = halves(counts);
  const peak = data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

  // Per-day % delivered, same basis as the Service-delivered chart (getPercentageData / 100).
  const pct = getPercentageData(data, predictedData, peakService, agg).scheduled.filter(
    (v) => !isNaN(v)
  );
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
