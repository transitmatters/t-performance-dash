import React from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground } from '../../../common/styles/general';
import { fetchSpeeds } from '../../../common/api/speed';
import { InfoTooltip } from '../../../common/components/general/InfoTooltip';
import { CompWidget } from '../../../common/components/widgets/internal/CompWidget';
import { DATE_FORMAT, OVERVIEW_OPTIONS } from '../../../common/constants/dates';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { DELAYS_RANGE_PARAMS_MAP, MINIMUMS } from '../../speed/constants/speeds';
import { calculateCommuteSpeedWidgetValues } from './utils/utils';

export const Speed: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const today = dayjs().format(DATE_FORMAT);
  const { startDate } = OVERVIEW_OPTIONS['weekly'];

  const speed = useQuery(['todaySpeed', line], () =>
    fetchSpeeds({ start_date: today, end_date: today, agg: 'daily', line: line })
  );

  const weekly = useQuery(
    ['speed', line, startDate, today, 'daily'],
    () => fetchSpeeds({ start_date: startDate, end_date: today, agg: 'daily', line }),
    { enabled: line != undefined }
  );

  const speedReady = line && weekly.data && speed.data && !speed.isLoading && !speed.isError;

  const divStyle = classNames(
    'items-center justify-center rounded-lg py-4 px-6 text-center sm:w-1/2 xl:w-1/3 text-opacity-95 text-white',
    lineColorBackground[line ?? 'DEFAULT']
  );

  if (!speedReady) {
    return (
      <div className={divStyle}>
        <div className="flex flex-row items-baseline justify-between">
          <p className="text-2xl font-semibold">Speed</p>
          <InfoTooltip
            info={`Speed is how quickly a train traverses the entire line, including time spent at stations.`}
          />
        </div>
        <ChartPlaceHolder query={speed} />
      </div>
    );
  }
  const { MPH, weeklyComp, peakComp } = calculateCommuteSpeedWidgetValues(
    weekly.data,
    speed.data,
    line
  );

  return (
    <div className={divStyle}>
      <div className="flex flex-row items-baseline justify-between">
        <p className="text-2xl font-semibold">Speed</p>
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
                Than <b>system peak</b> ({MINIMUMS[line ?? 'DEFAULT'].date})
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
};
