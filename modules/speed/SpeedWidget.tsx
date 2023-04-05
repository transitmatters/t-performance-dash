import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../../common/api/speed';
import type { TimeRange } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { DELAYS_RANGE_PARAMS_MAP, getSpeedGraphConfig } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedWidgetWrapper';
import dayjs from 'dayjs';

export const SpeedWidget: React.FC = () => {
  const {
    line,
    linePath,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));

  const speeds = useQuery(
    ['speed', line, startDate, endDate, config.agg],
    () => fetchSpeeds({ start_date: startDate, end_date: endDate, agg: config.agg, line }),
    { enabled: line != undefined }
  );

  const speedReady = !speeds.isError && speeds.data && line;

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Speed" href={`/${linePath}/speed`} />
        {speedReady ? (
          <SpeedGraphWrapper data={speeds.data} config={config} line={line} />
        ) : (
          <ChartPlaceHolder query={speeds} />
        )}
      </div>
    </>
  );
};
