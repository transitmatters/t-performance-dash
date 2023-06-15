import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { RIDERSHIP_KEYS } from '../../common/types/lines';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';

export const RidershipWidget: React.FC = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = SPEED_RANGE_PARAM_MAP.week;
  const lineId = query.busRoute
    ? `line-${query.busRoute.replaceAll('/', '')}`
    : RIDERSHIP_KEYS[line ?? ''];
  const lineOrRoute = query.busRoute ? `line-${query.busRoute.replaceAll('/', '')}` : line;
  const ridership = useRidershipData({
    line_id: lineId,
    start_date: startDate,
    end_date: endDate,
  });
  const serviceReady = !ridership.isError && lineId && lineOrRoute;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Weekday Ridership" tab="ridership" />
      {ridership.data && serviceReady ? (
        <RidershipGraphWrapper
          lineOrRoute={lineOrRoute}
          data={ridership.data}
          config={config}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <ChartPlaceHolder query={ridership} />
      )}
    </WidgetDiv>
  );
};
