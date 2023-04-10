import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { CORE_TRACK_LENGTHS } from '../constants/speeds';

export const getSpeedWidgetValues = (speeds: SpeedDataPoint[], line: Line) => {
  const current = CORE_TRACK_LENGTHS[line] / (speeds[speeds.length - 1].value / 3600);
  const delta = current - CORE_TRACK_LENGTHS[line] / (speeds[0].value / 3600);
  return { current, delta };
};
