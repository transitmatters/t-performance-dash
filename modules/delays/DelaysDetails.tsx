'use client';

import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/delays';
import { Widget, WidgetDiv } from '../../common/components/widgets';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import { lineColorTextHover } from '../../common/styles/general';
import type { LineRouteId } from '../../common/types/lines';
import { Accordion } from '../../common/components/accordion/Accordion';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { TotalDelayGraph } from './charts/TotalDelayGraph';
import { toDisplayedDelays } from './charts/utils';

export function DelaysDetails() {
  const {
    line,
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();

  // For commuter rail, use the crRoute from query params; otherwise use the default route ID
  const defaultRouteId =
    line === 'line-commuter-rail' && crRoute ? crRoute : lineToDefaultRouteId(line);
  const [routeId, setRouteId] = React.useState<LineRouteId>(defaultRouteId);
  const greenBranchToggle = React.useMemo(() => {
    return line === 'line-green' && <BranchSelector routeId={routeId} setRouteId={setRouteId} />;
  }, [line, routeId]);

  React.useEffect(() => {
    const newRouteId =
      line === 'line-commuter-rail' && crRoute ? crRoute : lineToDefaultRouteId(line);
    setRouteId(newRouteId);
  }, [line, crRoute]);

  // Determine whether to use daily or weekly data based on date range
  const agg = React.useMemo(() => {
    if (!startDate || !endDate) return 'weekly';
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysDiff = end.diff(start, 'day');
    // Use daily data for 90 days or less, weekly for longer ranges
    return daysDiff <= 90 ? 'daily' : 'weekly';
  }, [startDate, endDate]);

  const enabled = Boolean(startDate && endDate && line);
  const alertDelays = useAlertDelays(
    {
      start_date: startDate,
      end_date: endDate,
      line: routeId,
      agg: agg,
    },
    enabled
  );
  const delaysReady = alertDelays && line && !alertDelays.isError && alertDelays.data;
  const { delays, isActual } = React.useMemo(
    () => toDisplayedDelays(alertDelays.data ?? []),
    [alertDelays.data]
  );
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }
  return (
    <PageWrapper pageTitle={'Delays'}>
      <ChartPageDiv>
        <Widget title="Total Time Delayed" ready={[alertDelays]}>
          {delaysReady ? (
            <TotalDelayGraph
              data={delays}
              isActual={isActual}
              startDate={startDate}
              endDate={endDate}
              agg={agg}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
          {greenBranchToggle}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
            <DelayBreakdownGraph data={delays} startDate={startDate} endDate={endDate} agg={agg} />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={alertDelays} />
            </div>
          )}
          {greenBranchToggle}
        </Widget>
        <Widget title="Delay Time by Reason" ready={[alertDelays]}>
          {delaysReady ? (
            <DelayByCategoryGraph data={delays} />
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
                      long trains may be delayed: "delays of about 15 minutes" on the subway, or
                      "operating 10-20 minutes behind schedule" for a Commuter Rail train. We
                      collect these alerts, group them by general matching categories, and add up
                      the delay time for each day or week.
                    </p>
                    <h4 className="mt-2 font-semibold">Example Alerts</h4>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-clip-text text-mbta-blue shadow-none transition-shadow duration-300">
                        Blue Line
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        20 minutes
                      </span>{' '}
                      due to a{' '}
                      <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        power issue
                      </span>{' '}
                      near wood island. Some trains may hold at stations.
                    </blockquote>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-clip-text text-mbta-orange shadow-none transition-shadow duration-300">
                        Orange Line
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        10 minutes
                      </span>{' '}
                      due to a{' '}
                      <span className="animate-text bg-red-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        disabled train
                      </span>{' '}
                      at Northeastern.
                    </blockquote>
                    <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                      <span className="animate-text bg-clip-text text-mbta-green shadow-none transition-shadow duration-300">
                        Green Line D Branch
                      </span>
                      : Delays of about{' '}
                      <span className="animate-text bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        10 minutes
                      </span>{' '}
                      eastbound due to a maintenance train{' '}
                      <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                        inspecting the overhead
                      </span>{' '}
                      between riverside and kenmore.
                    </blockquote>
                    <h4 className="mt-4 font-semibold">How we measure delay time</h4>
                    <p>
                      On subway lines, delay time is how long the delay alerts were actually up,
                      from when the MBTA posted each one until it was taken down. Overlapping alerts
                      are only counted once, and an alert is counted for at most 3 hours, since
                      longer ones were almost always left up by mistake.
                    </p>
                    <p className="mt-2">
                      The top chart compares this with the delay the alerts stated. Alerts usually
                      stay up longer than the delay they state, because they cover the time it takes
                      service to recover: a "15 minute" alert is typically up for about 35 minutes.
                      When an alert is updated, its final stated delay is counted once.
                    </p>
                    <p className="mt-2">
                      Commuter Rail alerts are about individual trains and stay up until that train
                      finishes its trip, so for Commuter Rail we use the stated delay, which is how
                      far behind schedule the train ran.
                    </p>
                    <h4 className="mt-4 font-semibold">Where this data comes from</h4>
                    <p>
                      Alerts come from the MBTA's{' '}
                      <Link
                        href="https://performancedata.mbta.com/"
                        rel="noopener noreferrer"
                        target="_blank"
                        className={classNames('underline', lineColorTextHover[line ?? 'DEFAULT'])}
                      >
                        LAMP
                      </Link>{' '}
                      archive, which keeps every version of every alert since September 2019. The
                      most recent day uses alerts we collect live, and is filled in from LAMP the
                      next morning.
                    </p>
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
