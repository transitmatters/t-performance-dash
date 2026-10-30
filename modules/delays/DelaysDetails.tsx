'use client';

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
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
import { getBusRouteIds } from '../../common/constants/lines';
import type { LineRouteId } from '../../common/types/lines';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { Link } from '../../common/components/general/Link';
import { getFormattedTimeString } from '../../common/utils/time';
import { getDelayStats } from './utils';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { TotalDelayGraph } from './charts/TotalDelayGraph';
import { toDisplayedDelays } from './charts/utils';

export function DelaysDetails() {
  const {
    line,
    query: { startDate, endDate, crRoute, busRoute },
  } = useDelimitatedRoute();

  const [greenRouteId, setGreenRouteId] = useState<LineRouteId>(lineToDefaultRouteId('line-green'));
  // Green picks its branch from the toggle; commuter rail uses the crRoute from query params.
  const routeId =
    line === 'line-green'
      ? greenRouteId
      : line === 'line-commuter-rail' && crRoute
        ? crRoute
        : lineToDefaultRouteId(line);
  const greenBranchToggle = useMemo(() => {
    return (
      line === 'line-green' && <BranchSelector routeId={routeId} setRouteId={setGreenRouteId} />
    );
  }, [line, routeId]);

  // Determine whether to use daily or weekly data based on date range
  const agg = useMemo(() => {
    if (!startDate || !endDate) return 'weekly';
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysDiff = end.diff(start, 'day');
    // Use daily data for 90 days or less, weekly for longer ranges
    return daysDiff <= 90 ? 'daily' : 'weekly';
  }, [startDate, endDate]);

  // Bus delays are stored per GTFS route id; grouped labels (e.g. 114/116/117) are summed
  // server-side, and "Bus" is every route together.
  const delaysLine =
    line === 'line-bus' ? (busRoute ? getBusRouteIds(busRoute).join(',') : 'Bus') : routeId;

  const enabled = Boolean(startDate && endDate && line);
  const alertDelays = useAlertDelays(
    {
      start_date: startDate,
      end_date: endDate,
      line: delaysLine,
      agg: agg,
    },
    enabled
  );
  // The actual delay (time alerts were active) where the line has it, else the stated delay
  const { delays, isActual } = useMemo(
    () => toDisplayedDelays(alertDelays.data ?? []),
    [alertDelays.data]
  );
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = alertDelays.data ? getDelayStats(delays, agg, line) : null;

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
          subtitle={
            isActual
              ? `Per ${agg === 'weekly' ? 'week' : 'day'}: how long delay alerts were up, vs. the delay they stated`
              : `Per ${agg === 'weekly' ? 'week' : 'day'}, from rider alerts`
          }
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <TotalDelayGraph
            data={delays}
            isActual={isActual}
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
          <DelayBreakdownGraph data={delays} startDate={startDate} endDate={endDate} agg={agg} />
        </Widget>
        <Widget
          title="Delay time by reason"
          subtitle="Total for the period"
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayByCategoryGraph data={delays} />
        </Widget>
        <DataNotes>
          <p>
            When there's a delay on the T, the MBTA sends out an alert to riders. These alerts
            almost always include a reason for the delay, and an estimate of how long trains may be
            delayed: "delays of about 15 minutes" on the subway, or "operating 10-20 minutes behind
            schedule" for a Commuter Rail train. We collect these alerts, group them by general
            matching categories, and add up the delay time for each day or week.
          </p>
          {line === 'line-bus' && (
            <p>
              Bus alerts are posted per route, and most of them cite traffic. A grouped route adds
              up the alerts for each route in it, so an alert covering two of them counts twice.
            </p>
          )}
          <div>
            <h4 className="font-semibold">Example alerts</h4>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <span className="animate-text bg-clip-text text-mbta-blue shadow-none transition-shadow duration-300">
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
              <span className="animate-text bg-clip-text text-mbta-orange shadow-none transition-shadow duration-300">
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
              <span className="animate-text bg-clip-text text-mbta-green shadow-none transition-shadow duration-300">
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
          <div>
            <h4 className="font-semibold">How we measure delay time</h4>
            <p>
              On subway lines and bus routes, delay time is how long the delay alerts were actually
              up, from when the MBTA posted each one until it was taken down. Overlapping alerts are
              only counted once, and an alert is counted for at most 3 hours, since longer ones were
              almost always left up by mistake.
            </p>
            <p className="mt-2">
              The top chart compares this with the delay the alerts stated. Alerts usually stay up
              longer than the delay they state, because they cover the time it takes service to
              recover: a "15 minute" subway alert is typically up for about 35 minutes. When an
              alert is updated, its final stated delay is counted once.
            </p>
            <p className="mt-2">
              Commuter Rail alerts are about individual trains and stay up until that train finishes
              its trip, so for Commuter Rail we use the stated delay, which is how far behind
              schedule the train ran.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Where this data comes from</h4>
            <p>
              Alerts come from the MBTA&apos;s{' '}
              <Link
                href="https://performancedata.mbta.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                LAMP
              </Link>{' '}
              archive, which keeps every version of every alert since September 2019. The most
              recent day uses alerts we collect live, and is filled in from LAMP the next morning.
            </p>
          </div>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
