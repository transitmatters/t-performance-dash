'use client';

import React from 'react';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { Widget } from '../../common/components/widgets';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SPEED_RANGE_PARAM_MAP } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

// Bus trip metrics are daily-only -- there's no weekly/monthly rollup table like rail's --
// so the graph is always configured for day-level granularity, regardless of range length.
const config = SPEED_RANGE_PARAM_MAP.day;

export function BusSpeedDetails() {
  const {
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();
  const enabled = Boolean(startDate && endDate && busRoute);
  const speeds = useBusTripMetrics(
    { start_date: startDate, end_date: endDate, route: busRoute },
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
