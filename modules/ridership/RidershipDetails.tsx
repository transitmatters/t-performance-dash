import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { getRidershipLineId } from '../../common/utils/ridership';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';

export function RidershipDetails() {
  const {
    line,
    query: { startDate, endDate, busRoute, crRoute },
  } = useDelimitatedRoute();
  const config = SPEED_RANGE_PARAM_MAP.week;
  const lineId = getRidershipLineId(line, busRoute, crRoute);
  const enabled = Boolean(startDate && endDate && lineId);

  const ridership = useRidershipData(
    {
      line_id: lineId,
      start_date: startDate,
      end_date: endDate,
    },
    enabled
  );
  const ridershipDataReady = !ridership.isError && startDate && endDate && line && lineId;

  return (
    <PageWrapper pageTitle={'Ridership'}>
      <ChartPageDiv>
        <WidgetDiv>
          <WidgetTitle title="Weekday ridership" />

          {ridership.data && ridershipDataReady ? (
            <RidershipGraphWrapper
              data={ridership.data}
              config={config}
              startDate={startDate}
              endDate={endDate}
              line={line}
              busRoute={busRoute}
              crRoute={crRoute}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={ridership} />
            </div>
          )}
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

RidershipDetails.Layout = Layout.Dashboard;
