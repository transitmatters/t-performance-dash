'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useActualTripsDataByLine } from '../../common/api/hooks/dailytrips';
import { getSpeedGraphConfig } from './constants/speeds';
import { SpeedDetailsWrapper } from './SpeedDetailsWrapper';
dayjs.extend(utc);

export function SpeedDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
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
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Speed'}>
      <div className="flex flex-col">
        <div className="relative flex flex-col gap-4">
          {speedReady ? (
            <SpeedDetailsWrapper
              data={speeds.data}
              config={config}
              line={line}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={speeds} />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

SpeedDetails.Layout = Layout.Dashboard;
