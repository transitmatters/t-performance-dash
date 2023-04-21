import type { SpeedDataPoint } from '../../../common/types/dataPoints';

export const getOverviewServiceWidgetValues = (speeds: SpeedDataPoint[]) => {
  const { current, delta } = getCurrentAndDelta(speeds);
  const average = getAverage(speeds);
  return { current, delta, average };
};

export const getDetailsServiceWidgetValues = (speeds: SpeedDataPoint[]) => {
  const { current, delta } = getCurrentAndDelta(speeds);
  const average = getAverage(speeds);
  const peak = getPeak(speeds);
  return { current, delta, average, peak };
};

const getCurrentAndDelta = (speeds: SpeedDataPoint[]) => {
  const current = speeds[speeds.length - 1].count / 2;
  const delta = current - speeds[0].count / 2;
  return { current, delta };
};

const getAverage = (speeds: SpeedDataPoint[]) => {
  const averageCount =
    speeds.reduce((currentSum, speed) => currentSum + speed.count, 0) / speeds.length / 2;

  return averageCount;
};

const getPeak = (speeds: SpeedDataPoint[]) => {
  const minTimeEntry = speeds.reduce((currentMax, speed) => {
    if (speed.count > currentMax.count) return speed;
    return currentMax;
  }, speeds[0]);

  return { ...minTimeEntry, value: minTimeEntry.count / 2 };
};
