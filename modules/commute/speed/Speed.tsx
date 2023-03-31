import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../../../common/api/speed';
import { useDelimitatedRoute } from '../../../common/utils/router';
import classNames from 'classnames';
import { lineColorBackground } from '../../../common/styles/general';
import dayjs from 'dayjs';
import { DELAYS_RANGE_PARAMS_MAP } from '../../speed/constants/speeds';
import { InfoTooltip } from '../../../common/components/general/InfoTooltip';
import { calculateCommuteSpeedWidgetValues } from './utils/utils';
import { CompWidget } from './CompWidget';
import { DATE_FORMAT } from '../../../common/components/inputs/DateSelection/DateConstants';

export const Speed: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const today = dayjs().format(DATE_FORMAT);
  const { agg, endDate, startDate } = DELAYS_RANGE_PARAMS_MAP['week'];

  const speed = useQuery(['speed', line], () =>
    fetchSpeeds({ start_date: today, end_date: today, agg: 'daily', line: line })
  );

  // This query is shared with the overview page - they both get the weekly times.
  const weekly = useQuery(
    ['traversal', line, today, endDate, agg],
    () => fetchSpeeds({ start_date: startDate, end_date: endDate, agg, line }),
    { enabled: line != undefined }
  );

  const { MPH, weeklyComp, peakComp } = useMemo(() => {
    return calculateCommuteSpeedWidgetValues(weekly.data ?? [], speed.data ?? [], line);
  }, [weekly.data, speed.data, line]);

  const divStyle = classNames(
    'items-center justify-center rounded-lg py-4 px-6 text-center sm:w-1/2 xl:w-1/3 text-opacity-95 text-white',
    lineColorBackground[line ?? 'DEFAULT']
  );

  if (speed.isError) {
    return <div className={divStyle}>Error</div>;
  }
  if (speed.isLoading) {
    return <div className={divStyle}>Loading...</div>;
  }

  return (
    <div className={divStyle}>
      <div className="flex flex-row items-baseline justify-between">
        <p className="text-2xl font-semibold ">Speed</p>
        <InfoTooltip
          info={`Speed is how quickly a train traverses the entire line, including time spent at stations.`}
        />
      </div>
      <div className="mt-2 flex flex-row items-baseline justify-center gap-x-1">
        <p className={classNames('text-5xl font-semibold')}>
          {isNaN(MPH) ? '...' : MPH.toFixed(1)}
        </p>
        <p className="text-2xl text-opacity-90">mph</p>
      </div>
      <div className="pt-4">
        <div className="mt-2 flex flex-col gap-x-2 gap-y-2">
          <CompWidget
            value={weeklyComp}
            text={
              <p>
                Than <b>7 day</b> average
              </p>
            }
          />
          <CompWidget
            value={peakComp}
            text={
              <p>
                Than <b>system peak</b> (April 2020)
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
};
