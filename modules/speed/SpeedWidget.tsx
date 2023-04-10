import React from 'react';
import classNames from 'classnames';
import { useSpeedData } from '../../common/api/hooks/speed';
import type { TimeRange } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { DELAYS_RANGE_PARAMS_MAP } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedWidgetWrapper';

interface SpeedWidgetProps {
  timeRange: TimeRange;
}

export const SpeedWidget: React.FC<SpeedWidgetProps> = ({ timeRange }) => {
  const { line, linePath } = useDelimitatedRoute();
  const { agg, endDate, startDate, comparisonStartDate, comparisonEndDate } =
    DELAYS_RANGE_PARAMS_MAP[timeRange];

  const speeds = useSpeedData({ start_date: startDate, end_date: endDate, agg, line });
  const compSpeeds = useSpeedData({
    start_date: comparisonStartDate,
    end_date: comparisonEndDate,
    agg,
    line,
  });
  const speedReady =
    !compSpeeds.isError && !speeds.isError && speeds.data && compSpeeds.data && line;

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Speed" href={`/${linePath}/speed`} />
        {speedReady ? (
          <SpeedGraphWrapper
            timeRange={timeRange}
            data={speeds.data}
            compData={compSpeeds.data}
            line={line}
          />
        ) : (
          <ChartPlaceHolder query={speeds} />
        )}
      </div>
    </>
  );
};
