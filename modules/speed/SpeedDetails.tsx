'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { getSpeedGraphConfig } from './constants/speeds';
import { SpeedDetailsWrapper } from './SpeedDetailsWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
dayjs.extend(utc);

export function SpeedDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const speeds = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );
  const speedReady = speeds && line && config && !speeds.isError && speeds.data;
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        {speedReady ? (
          <SpeedDetailsWrapper
            data={speeds.data}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="relative flex h-full">
            <ChartPlaceHolder query={speeds} />
          </div>
        )}
      </ChartPageDiv>
    </PageWrapper>
  );
}

SpeedDetails.Layout = Layout.Dashboard;
