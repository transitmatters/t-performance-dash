'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/reliability';
import { Widget } from '../../common/components/widgets';
import { TotalDelayGraph } from './charts/TotalDelayGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';

dayjs.extend(utc);

export function ReliabilityDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const enabled = Boolean(startDate && endDate && line);
  const alertDelays = useAlertDelays(
    {
      start_date: startDate,
      end_date: endDate,
      line,
    },
    enabled
  );
  const reliabilityReady = alertDelays && line && !alertDelays.isError && alertDelays.data;
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Reliability'}>
      <ChartPageDiv>
        <Widget title="Total Time Delayed" ready={[alertDelays]}>
          {reliabilityReady ? (
            <TotalDelayGraph data={alertDelays.data} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {reliabilityReady ? (
            <DelayBreakdownGraph data={alertDelays.data} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {reliabilityReady ? (
            <DelayByCategoryGraph data={alertDelays.data} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

ReliabilityDetails.Layout = Layout.Dashboard;
