'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/delays';
import { Widget } from '../../common/components/widgets';
import { TotalDelayGraph } from './charts/TotalDelayGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';

dayjs.extend(utc);

export function DelaysDetails() {
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
  const delaysReady = alertDelays && line && !alertDelays.isError && alertDelays.data;
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Delays'}>
      <ChartPageDiv>
        <Widget title="Total Time Delayed" ready={[alertDelays]}>
          {delaysReady ? (
            <TotalDelayGraph data={alertDelays.data} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
            <DelayBreakdownGraph data={alertDelays.data} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
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

DelaysDetails.Layout = Layout.Dashboard;
