import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useSpeedData } from '../../common/api/hooks/speed';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { SpeedGraphWrapper } from './SpeedWidgetWrapper';
import { getSpeedGraphConfig } from './constants/speeds';

export const SpeedWidget: React.FC = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate, agg } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const speeds = useSpeedData({
    start_date: startDate,
    end_date: endDate,
    agg: agg,
    line,
  });

  const speedReady = !speeds.isError && speeds.data && line;

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Speed" tab="speed" />
        {speedReady ? (
          <SpeedGraphWrapper data={speeds.data} config={config} line={line} />
        ) : (
          <ChartPlaceHolder query={speeds} />
        )}
      </div>
    </>
  );
};
