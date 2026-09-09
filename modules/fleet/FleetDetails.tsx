'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { FleetDetailsWrapper } from './FleetDetailsWrapper';

dayjs.extend(utc);

export function FleetDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const fleetMetrics = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );
  const fleetMetricsReady =
    fleetMetrics && line && config && !fleetMetrics.isError && fleetMetrics.data;
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Fleet'}>
      <ChartPageDiv>
        {fleetMetricsReady ? (
          <FleetDetailsWrapper
            data={fleetMetrics.data}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="relative flex h-full">
            <ChartPlaceHolder query={fleetMetrics} />
          </div>
        )}
      </ChartPageDiv>
    </PageWrapper>
  );
}

FleetDetails.Layout = Layout.Dashboard;
