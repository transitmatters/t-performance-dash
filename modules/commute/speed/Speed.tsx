import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground } from '../../../common/styles/general';
import { useSpeedData } from '../../../common/api/hooks/speed';
import { InfoTooltip } from '../../../common/components/general/InfoTooltip';
import { CompWidget } from '../../../common/components/widgets/internal/CompWidget';
import { DATE_FORMAT, OVERVIEW_OPTIONS } from '../../../common/constants/dates';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { MINIMUMS } from '../../speed/constants/speeds';
import { calculateCommuteSpeedWidgetValues } from './utils/utils';

export const Speed: React.FC = () => {
  const { line } = useDelimitatedRoute();
  const today = dayjs().format(DATE_FORMAT);
  const { startDate } = OVERVIEW_OPTIONS.week;

  const speed = useSpeedData({ line, start_date: today, end_date: today, agg: 'daily' });
  const weekly = useSpeedData({ line, start_date: startDate, end_date: today, agg: 'daily' });

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
        <ChartPlaceHolder query={speed} isInverse />
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
