import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { CORE_TRACK_LENGTHS } from '../constants/speeds';

export const getSpeedWidgetValues = (
  speeds: SpeedDataPoint[],
  compSpeeds: SpeedDataPoint[],
  line: Line
) => {
  const values = speeds.map((datapoint) => CORE_TRACK_LENGTHS[line] / (datapoint.value / 3600));
  const compValues = compSpeeds.map(
    (datapoint) => CORE_TRACK_LENGTHS[line] / (datapoint.value / 3600)
  );
  if (!values.length || !compValues.length) {
    return { average: 0, delta: 0 };
  }

  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const compAverage = compValues.reduce((a, b) => a + b, 0) / compValues.length;
  const delta = average - compAverage;
  return { average, delta };
};
