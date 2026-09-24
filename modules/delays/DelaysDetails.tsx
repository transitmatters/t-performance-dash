'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/delays';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import type { LineRouteId } from '../../common/types/lines';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { getFormattedTimeString } from '../../common/utils/time';
import { getDelayStats } from './utils';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { TotalDelayGraph } from './charts/TotalDelayGraph';

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
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = alertDelays.data ? getDelayStats(alertDelays.data, agg) : null;

  const deltaFor = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = Math.abs(delta) <= 1 ? 'flat' : delta < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
    return { label: `${sign}${getFormattedTimeString(delta, 'minutes')} · ${word}`, sentiment };
  };

  return (
    <PageWrapper pageTitle={'Delays'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgDelay) && (
          <StatCardGrid>
            <StatCard
              label="Total time delayed"
              value={getFormattedTimeString(stats.totalDelay, 'minutes')}
            />
            <StatCard
              label={`Avg per ${stats.agg === 'weekly' ? 'week' : 'day'}`}
              value={getFormattedTimeString(stats.avgDelay, 'minutes')}
              delta={deltaFor(stats.avgDelayDelta)}
            />
            {stats.topReasonLabel && stats.topReasonShare != null && (
              <StatCard
                label={stats.topReasonLabel}
                value={`${Math.round(stats.topReasonShare * 100)}%`}
                unit="of delay time"
              />
            )}
          </StatCardGrid>
        )}
        <Widget
          title="Total time delayed"
          subtitle={`Per ${agg === 'weekly' ? 'week' : 'day'}, from rider alerts`}
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <TotalDelayGraph
            data={alertDelays.data!}
            startDate={startDate}
            endDate={endDate}
            agg={agg}
          />
        </Widget>
        <Widget
          title="Delay time by reason"
          subtitle="Over time"
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayBreakdownGraph
            data={alertDelays.data!}
            startDate={startDate}
            endDate={endDate}
            agg={agg}
          />
        </Widget>
        <Widget
          title="Delay time by reason"
          subtitle="Total for the period"
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayByCategoryGraph data={alertDelays.data!} />
        </Widget>
        <DataNotes>
          <p>
            When there's a delay on the T, the MBTA sends out an alert to riders. These alerts
            almost always include a reason for the delay, and an estimate of how long trains may be
            delayed. We collect these alerts and group them by general matching categories, and add
            up the total delay time to riders in a week.
          </p>
          <div>
            <h4 className="font-semibold">Example alerts</h4>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <span className="animate-text text-mbta-blue bg-clip-text shadow-none transition-shadow duration-300">
                Blue Line
              </span>
              : Delays of about{' '}
              <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                20 minutes
              </span>{' '}
              due to a{' '}
              <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                power issue
              </span>{' '}
              near wood island. Some trains may hold at stations.
            </blockquote>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <span className="animate-text text-mbta-orange bg-clip-text shadow-none transition-shadow duration-300">
                Orange Line
              </span>
              : Delays of about{' '}
              <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                10 minutes
              </span>{' '}
              due to a{' '}
              <span className="animate-text bg-red-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                disabled train
              </span>{' '}
              at Northeastern.
            </blockquote>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <span className="animate-text text-mbta-green bg-clip-text shadow-none transition-shadow duration-300">
                Green Line D Branch
              </span>
              : Delays of about{' '}
              <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                10 minutes
              </span>{' '}
              eastbound due to a maintenance train{' '}
              <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300">
                inspecting the overhead
              </span>{' '}
              between riverside and kenmore.
            </blockquote>
          </div>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}

DelaysDetails.Layout = Layout.Dashboard;
