import { SpeedDataPoint } from '../../../../common/types/dataPoints';
import { CORE_TRACK_LENGTHS, PEAK_MPH } from '../../../speed/constants/speeds';

export const calculateCommuteSpeedWidgetValues = (
  weeklyData: any[],
  speed: SpeedDataPoint[] | [],
  line: string | undefined
) => {
  const weeklyAverage =
    weeklyData.reduce((sum, next) => sum + next.value, 0) / weeklyData.length / 3600;
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
