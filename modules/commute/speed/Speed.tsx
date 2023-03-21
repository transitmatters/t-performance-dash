import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLineTraversalTimes, fetchScheduleAdherence } from '../../../common/api/speed';
import { useDelimitatedRoute } from '../../../common/utils/router';
import classNames from 'classnames';
import { lineColorBackground } from '../../../common/styles/general';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../../common/constants/dates';
import {
  MINIMUMS,
  DELAYS_RANGE_PARAMS_MAP,
  CORE_TRACK_LENGTHS,
  PEAK_MPH,
} from '../../speed/constants/delays';
import { InfoTooltip } from '../../../common/components/general/InfoTooltip';
import { MPHWidgetValue, PercentageWidgetValue } from '../../../common/types/basicWidgets';
import { Delta } from '../../../common/components/widgets/internal/Delta';

export const Speed: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const today = dayjs().format(DATE_FORMAT);
  const { agg, endDate, startDate } = DELAYS_RANGE_PARAMS_MAP['week'];
  const speed = useQuery(['speed', line], () =>
    fetchLineTraversalTimes({ start_date: today, end_date: today, agg: 'daily', line: line })
  );

  // This query is shared with the overview page - they both get the monthly times.
  const weekly = useQuery(
    ['traversal', line, today, endDate, agg],
    () => fetchLineTraversalTimes({ start_date: startDate, end_date: endDate, agg, line }),
    { enabled: line != undefined }
  );
  if (speed.isError) {
    return <p>Error</p>;
  }

  const weeklyData = weekly.data || [];
  const weeklyAverage =
    weeklyData.reduce((sum, next) => sum + next.value, 0) / weeklyData.length / 3600;
  const speedData = speed.data || [];
  const speedInHours = (speedData[0]?.value ?? undefined) / 3600;
  const MPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / speedInHours;
  const weeklyAverageMPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / weeklyAverage;
  const widgetValue = new MPHWidgetValue(MPH ?? undefined, MPH - weeklyAverageMPH);
  const peakWidget = new PercentageWidgetValue(MPH ?? undefined, MPH / PEAK_MPH[line ?? 'DEFAULT']);

  const scheduleAdherence = useQuery(['scheduleAdherence', line], () =>
    fetchScheduleAdherence(line)
  );

  const scheduleAdherenceData = scheduleAdherence.data || [];
  const sched = scheduleAdherenceData[0]?.value;
  const scheduledMPH = CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (sched / 3600);

  const schedAdherenceWidget = new MPHWidgetValue(
    MPH ?? undefined,
    MPH - scheduledMPH ?? undefined
  );

  return (
    <div
      className={classNames(
        'items-center justify-center rounded-lg py-4 px-6 text-center sm:w-1/2 xl:w-1/4',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className="flex flex-row items-baseline justify-between">
        <p className="text-2xl font-semibold text-white">Speed</p>
        <InfoTooltip
          info={`Speed is how quickly a train traverses the entire line, including time spent at stations.`}
        />
      </div>
      <div className="mt-2 flex flex-row items-baseline justify-center gap-x-1">
        <p className={classNames('text-5xl font-semibold text-gray-100 ')}>{MPH.toFixed(1)}</p>
        <p className="text-2xl text-gray-200">mph</p>
      </div>
      <div className="pt-4">
        <div className="relative flex w-full items-center justify-center rounded-full border border-white border-opacity-50 shadow-sm">
          <div
            className={classNames(
              'z-10 my-1 flex flex-row rounded-full  border border-black border-opacity-20 px-2 shadow-sm',
              lineColorBackground[line ?? 'DEFAULT']
            )}
          >
            <p className="whitespace-nowrap pr-2 text-center text-white">
              {peakWidget.getFormattedDelta().slice(1)} of peak
            </p>
            <InfoTooltip
              info={`The peak speed is the fastest recorded monthly speed (${PEAK_MPH[
                line ?? 'default'
              ].toFixed(1)})`}
              size={4}
            />
          </div>
          <div
            className="absolute left-0 h-full rounded-full bg-white bg-opacity-50 shadow-md"
            style={{ width: `${peakWidget.getFormattedDelta().slice(1)}` }}
          ></div>
        </div>
        <div className="mt-2 flex flex-col gap-x-2 gap-y-2 lg:flex-row">
          <div className="flex w-full flex-row items-baseline justify-between gap-x-1 rounded-lg border-black border-opacity-30 bg-black bg-opacity-20 px-2 py-1">
            <div className="flex flex-row items-center">
              <div>
                <Delta widgetValue={widgetValue} sentimentDirection={'positiveOnIncrease'} />
              </div>
              <p className={classNames('pl-1 text-xs text-gray-100 sm:text-sm')}>
                from weekly avg.
              </p>
            </div>
            <InfoTooltip
              info={`Current speed compared to the speed over the last 7 days`}
              size={4}
            />
          </div>
          <div className="flex  w-full flex-row items-baseline justify-between gap-x-1 rounded-lg border-black border-opacity-30 bg-black bg-opacity-20 px-2 py-1">
            <div className="flex flex-row items-center">
              <div>
                <Delta
                  widgetValue={schedAdherenceWidget}
                  sentimentDirection={'positiveOnIncrease'}
                />
              </div>
              <p className={classNames('pl-1 text-xs text-gray-100 sm:text-sm')}>from schedule</p>
            </div>
            <InfoTooltip
              info={`The current speed compared to the speed the MBTA has scheduled.`}
              size={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
