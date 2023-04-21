import type { SpeedDataPoint } from '../../../common/types/dataPoints';

export const getOverviewServiceWidgetValues = (datapoints: SpeedDataPoint[]) => {
  const { current, delta } = getCurrentAndDelta(datapoints);
  const average = getAverage(datapoints);
  return { current, delta, average };
};

export const getDetailsServiceWidgetValues = (datapoints: SpeedDataPoint[]) => {
  const { current, delta } = getCurrentAndDelta(datapoints);
  const average = getAverage(datapoints);
  const peak = getPeak(datapoints);
  return { current, delta, average, peak };
};

const getCurrentAndDelta = (datapoints: SpeedDataPoint[]) => {
  const current = datapoints[datapoints.length - 1].count / 2;
  const delta = current - datapoints[0].count / 2;
  return { current, delta };
};

const getAverage = (datapoints: SpeedDataPoint[]) => {
  const averageCount =
    datapoints.reduce((currentSum, speed) => currentSum + speed.count, 0) / datapoints.length / 2;

  return averageCount;
};

const getPeak = (datapoints: SpeedDataPoint[]) => {
  const minTimeEntry = datapoints.reduce((currentMax, speed) => {
    if (speed.count > currentMax.count) return speed;
    return currentMax;
  }, datapoints[0]);

  return { ...minTimeEntry, value: minTimeEntry.count / 2 };
};
