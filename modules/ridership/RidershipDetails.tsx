import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { RIDERSHIP_KEYS } from '../../common/types/lines';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { RidershipDetailsWrapper } from './RidershipDetailsWrapper';

export function RidershipDetails() {
  const {
    line,
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();
  const config = SPEED_RANGE_PARAM_MAP.week;
  const lineId = busRoute ? `line-${busRoute.replaceAll('/', '')}` : RIDERSHIP_KEYS[line ?? ''];
  const enabled = Boolean(startDate && endDate && lineId);

  const ridership = useRidershipData(
    {
      line_id: lineId,
      start_date: startDate,
      end_date: endDate,
    },
    enabled
  );
  const ridershipDataReady = !ridership.isError && startDate && endDate;

  return (
    <PageWrapper pageTitle={'Ridership'}>
      {ridership.data && ridershipDataReady ? (
        <RidershipDetailsWrapper
          data={ridership.data}
          config={config}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <div className="relative flex h-full">
          <ChartPlaceHolder query={ridership} />
        </div>
      )}
    </PageWrapper>
  );
}

RidershipDetails.Layout = Layout.Dashboard;
