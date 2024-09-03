'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Link from 'next/link';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/delays';
import { Widget, WidgetDiv } from '../../common/components/widgets';
import { TotalDelayGraph } from './charts/TotalDelayGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import { LineRouteId } from '../../common/types/lines';
import { Accordion } from '../../common/components/accordion/Accordion';

dayjs.extend(utc);

export function DelaysDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const [routeId, setRouteId] = React.useState<LineRouteId>(lineToDefaultRouteId(line));
  const greenBranchToggle = React.useMemo(() => {
    return line === 'line-green' && <BranchSelector routeId={routeId} setRouteId={setRouteId} />;
  }, [line, routeId]);

  React.useEffect(() => {
    setRouteId(lineToDefaultRouteId(line));
  }, [line]);

  const enabled = Boolean(startDate && endDate && line);
  const alertDelays = useAlertDelays(
    {
      start_date: startDate,
      end_date: endDate,
      line: routeId,
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
          {greenBranchToggle}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
            <DelayBreakdownGraph data={alertDelays.data} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
          {greenBranchToggle}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
            <DelayByCategoryGraph data={alertDelays.data} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
          {greenBranchToggle}
        </Widget>
        <WidgetDiv>
          <Accordion
            contentList={[
              {
                title: 'About this data',
                content: (
                  <div>
                    <p>
                      When there's a delay on the T, the MBTA sends out an alert to riders. These
                      alerts almost always include a reason for the delay, and an estimate of how
                      long trains may be delayed. We collect these alerts and group them by general
                      matching categories, and add up the total delay time to riders in a week.
                    </p>
                    <h4 className="mt-2 font-semibold">Example Alerts</h4>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-transparent bg-clip-text text-mbta-blue shadow-none transition-shadow duration-300">
                        Blue Line
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-transparent bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        20 minutes
                      </span>{' '}
                      due to a{' '}
                      <span className="animate-text bg-[#eab308] bg-transparent bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        power issue
                      </span>{' '}
                      near wood island. Some trains may hold at stations.
                    </blockquote>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-transparent bg-clip-text text-mbta-orange shadow-none transition-shadow duration-300">
                        Orange Line
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-transparent bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        10 minutes
                      </span>{' '}
                      due to a{' '}
                      <span className="animate-text bg-[#dc2626] bg-transparent bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        disabled train
                      </span>{' '}
                      at Northeastern.
                    </blockquote>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-transparent bg-clip-text text-mbta-green shadow-none transition-shadow duration-300">
                        Green Line D Branch
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-transparent bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        10 minutes
                      </span>{' '}
                      eastbound due to a maintenance train{' '}
                      <span className="animate-text bg-[#eab308] bg-transparent bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        inspecting the overhead
                      </span>{' '}
                      between riverside and kenmore.
                    </blockquote>
                  </div>
                ),
              },
            ]}
            size={'lg'}
          />
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

DelaysDetails.Layout = Layout.Dashboard;
