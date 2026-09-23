'use client';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { Widget } from '../../common/components/widgets';
import { getBusRouteIds } from '../../common/constants/lines';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getSpeedGraphConfig } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

export function BusSpeedDetails() {
  const {
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();
  // Same day/week/month thresholds as rail. Bus has no weekly/monthly tables, so the API
  // rolls daily rows up server-side when agg isn't daily.
  const config = useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );
  const enabled = Boolean(startDate && endDate && busRoute);
  const speeds = useBusTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      // Grouped labels (e.g. 114/116/117) are summed server-side across their route_ids.
      route: busRoute ? getBusRouteIds(busRoute).join(',') : undefined,
      agg: config.agg,
    },
    enabled
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        <BusDataNotice />
        <Widget title="Speed" ready={[speeds]}>
          <SpeedGraphWrapper
            data={speeds.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedDetails.Layout = Layout.Dashboard;
