import React from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { getRidershipLineId } from '../../common/utils/ridership';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';

export const RidershipWidget: React.FC = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const lineId = getRidershipLineId(line, query.busRoute, query.crRoute);
  const ridership = useRidershipData({
    line_id: lineId,
    start_date: startDate,
    end_date: endDate,
  });
  const serviceReady = !ridership.isError && lineId && line;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Weekday ridership" tab="ridership" />
      {ridership.data && serviceReady ? (
        <RidershipGraphWrapper
          line={line}
          busRoute={query.busRoute}
          crRoute={query.crRoute}
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
