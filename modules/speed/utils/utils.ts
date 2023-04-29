import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { CORE_TRACK_LENGTHS } from '../constants/speeds';

export const getOverviewSpeedWidgetValues = (speeds: SpeedDataPoint[], line: Line) => {
  const trackDistance = CORE_TRACK_LENGTHS[line];

  const { current, delta } = getCurrentAndDelta(speeds, trackDistance);
  const average = getAverage(speeds, trackDistance);
  return { current, delta, average };
};

export const getDetailsSpeedWidgetValues = (speeds: SpeedDataPoint[], line: Line) => {
  const trackDistance = CORE_TRACK_LENGTHS[line];

  const { current, delta } = getCurrentAndDelta(speeds, trackDistance);
  const average = getAverage(speeds, trackDistance);
  const peak = getPeak(speeds, trackDistance);
  return { current, delta, average, peak };
};

const getCurrentAndDelta = (speeds: SpeedDataPoint[], trackDistance: number) => {
  const current = trackDistance / (speeds[speeds.length - 1].value / 3600);
  const delta = current - trackDistance / (speeds[0].value / 3600);
  return { current, delta };
};

const getAverage = (speeds: SpeedDataPoint[], trackDistance: number) => {
  const averageTime =
    speeds.reduce((currentSum, speed) => currentSum + speed.value, 0) / speeds.length / 3600;

  return trackDistance / averageTime;
};

const getPeak = (speeds: SpeedDataPoint[], trackDistance: number) => {
  const minTimeEntry = speeds.reduce((currentMin, speed) => {
    if (speed.value < currentMin.value) return speed;
    return currentMin;
  }, speeds[0]);

  return { ...minTimeEntry, value: trackDistance / (minTimeEntry.value / 3600) };
};
