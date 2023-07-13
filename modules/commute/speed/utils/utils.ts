import { PEAK_MPH } from '../../../../common/constants/baselines';
import type { SpeedDataPoint } from '../../../../common/types/dataPoints';
import { CORE_TRACK_LENGTHS } from '../../../speed/constants/speeds';

export const calculateCommuteSpeedWidgetValues = (
  weeklyData: SpeedDataPoint[],
  speed: SpeedDataPoint[],
  line: string
) => {
  const weeklyDataNoNulls = weeklyData.filter((datapoint) => datapoint.value !== null);
  const weeklyAverage =
    weeklyDataNoNulls.reduce((sum, next) => sum + next.value, 0) / weeklyDataNoNulls.length / 3600;
  const speedInHours = (speed[0]?.value ?? undefined) / 3600;
  const MPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / speedInHours;
  const weeklyAverageMPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / weeklyAverage;
  const weeklyComp = Math.round((100 * (MPH - weeklyAverageMPH)) / weeklyAverageMPH);
  const peakComp = Math.round(
    (100 * (MPH - PEAK_MPH[line ?? 'DEFAULT'])) / PEAK_MPH[line ?? 'DEFAULT']
  );

  return {
    MPH,
    weeklyComp,
    peakComp,
  };
};
