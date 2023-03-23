import { QueryObserverSuccessResult, QueryObserverLoadingResult } from '@tanstack/react-query';
import { MPHWidgetValue, PercentageWidgetValue } from '../../../../common/types/basicWidgets';
import { MedianTraversalTime } from '../../../../common/types/dataPoints';
import { CORE_TRACK_LENGTHS, PEAK_MPH } from '../../../speed/constants/speeds';

export const calculateCommuteSpeedWidgetValues = (
  weeklyData: any[],
  speed: MedianTraversalTime[] | [],
  line: string | undefined,
  scheduleAdherenceData: { value: any }[]
) => {
  const weeklyAverage =
    weeklyData.reduce((sum, next) => sum + next.value, 0) / weeklyData.length / 3600;
  const speedInHours = (speed[0]?.value ?? undefined) / 3600;
  const MPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / speedInHours;
  const weeklyAverageMPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / weeklyAverage;
  const mphWidget = new MPHWidgetValue(MPH ?? undefined, MPH - weeklyAverageMPH);
  const peakWidget = new PercentageWidgetValue(MPH ?? undefined, MPH / PEAK_MPH[line ?? 'DEFAULT']);

  const sched = scheduleAdherenceData[0]?.value;
  const scheduledMPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (sched / 3600);

  const schedAdherenceWidget = new MPHWidgetValue(
    MPH ?? undefined,
    MPH - scheduledMPH ?? undefined
  );

  const weeklyComp = Math.round((100 * (MPH - weeklyAverageMPH)) / weeklyAverageMPH);
  const peakComp = Math.round(
    (100 * (MPH - PEAK_MPH[line ?? 'DEFAULT'])) / PEAK_MPH[line ?? 'DEFAULT']
  );

  return {
    weeklyAverageMPH,
    peakWidget,
    schedAdherenceWidget,
    MPH,
    mphWidget,
    weeklyComp,
    peakComp,
  };
};
