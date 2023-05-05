import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { CORE_TRACK_LENGTHS } from '../constants/speeds';

const calcValues = (speeds: SpeedDataPoint[], trackDistance: number, isOverview = false) => {
  const current = trackDistance / (speeds[speeds.length - 1].value / 3600);
  const average =
    trackDistance /
    (speeds.reduce((currentSum, speed) => currentSum + speed.value, 0) / speeds.length / 3600);
  const peakEntry = {
    ...speeds.reduce((max, speed) => (speed.value < max.value ? speed : max), speeds[0]),
  };
  const peak = { ...peakEntry, value: trackDistance / (peakEntry.value / 3600) };
  const delta = isOverview
    ? current - peak.value
    : current - trackDistance / (speeds[0].value / 3600);

  return {
    current,
    delta,
    average,
    peak,
  };
};

export const getOverviewSpeedWidgetValues = (datapoints: SpeedDataPoint[], line: Line) => {
  const trackDistance = CORE_TRACK_LENGTHS[line];
  return calcValues(datapoints, trackDistance, true);
};
export const getDetailsSpeedWidgetValues = (datapoints: SpeedDataPoint[], line: Line) => {
  const trackDistance = CORE_TRACK_LENGTHS[line];
  return calcValues(datapoints, trackDistance);
};
