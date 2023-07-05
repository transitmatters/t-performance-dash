import React from 'react';
import dayjs from 'dayjs';
import { useSpeedData } from '../../common/api/hooks/speed';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { getSpeedGraphConfig } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';
import { useActualTripsDataByLine } from '../../common/api/hooks/dailytrips';

export const SpeedWidget: React.FC = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate, agg } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const speeds = useActualTripsDataByLine(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );
  const speedReady = speeds && line && config && !speeds.isError && speeds.data;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Speed" tab="speed" />
      {speedReady ? (
        <SpeedGraphWrapper
          data={speeds.data}
          config={config}
          line={line}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <ChartPlaceHolder query={speeds} />
      )}
    </WidgetDiv>
  );
};
