import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';

const calcValues = (speeds: DeliveredTripMetrics[], isOverview = false) => {
  const mphs = speeds.map((speed) => {
    return { mph: speed.miles_covered / (speed.total_time / 3600), date: speed.date };
  });
  const current = mphs[mphs.length - 1].mph;
  const average =
    mphs.reduce((currentSum, mph) => (!isNaN(mph.mph) ? currentSum + mph.mph : currentSum), 0) /
    mphs.length;
  const peak = {
    ...mphs.reduce((max, mph) => (mph.mph > max.mph ? mph : max), mphs[0]),
  };

  // TODO: This is unused.
  const delta = isOverview ? current - peak.mph : current - mphs[0].mph;

  return {
    current,
    delta,
    average,
    peak,
  };
};

export const getDetailsSpeedWidgetValues = (datapoints: DeliveredTripMetrics[]) => {
  return calcValues(datapoints);
};
