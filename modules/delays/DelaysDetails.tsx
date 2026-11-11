'use client';

import { useDelimitatedRoute } from '../../common/utils/router';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { Widget } from '../../common/components/widgets';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { Link } from '../../common/components/general/Link';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { DelayStats } from './DelayStats';
import { useFocusedReason } from './useFocusedReason';
import { useDelays } from './useDelays';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayTotalBars } from './charts/DelayTotalBars';
import { DelayCauseBars } from './charts/DelayCauseBars';

const STACK_MODE_OPTIONS: ['minutes' | 'share', string][] = [
  ['minutes', 'Minutes'],
  ['share', 'Share'],
];

export function DelaysDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const {
    alertDelays,
    agg,
    period,
    isActual,
    delayData,
    series,
    rangeData,
    rangeQueries,
    greenBranch,
  } = useDelays(startDate, endDate);
  const greenBranchToggle = line === 'line-green' && (
    <BranchSelector routeId={greenBranch.routeId} setRouteId={greenBranch.setRouteId} />
  );

  const { focus, setFocus } = useFocusedReason();
  const { value: stackMode, control: stackModeControl } = useChartToggle(
    'minutes',
    STACK_MODE_OPTIONS,
    { variant: 'toggle', paramKey: 'dlView' }
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Delays'}>
      <ChartPageDiv>
        {rangeData && <DelayStats data={rangeData} agg={agg} line={line} />}
        <Widget
          title="How much delay"
          subtitle={
            isActual
              ? `Minutes a delay alert was up, per ${period}`
              : `Minutes delayed per ${period}, from rider alerts`
          }
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayTotalBars
            data={delayData ?? []}
            startDate={startDate}
            endDate={endDate}
            agg={agg}
            focus={focus}
          />
        </Widget>
        <Widget
          title="What caused it"
          subtitle="Total for these dates. Click a cause to see it in the chart above."
          ready={rangeQueries}
          action={
            focus && (
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="rounded-sm text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Clear highlight
              </button>
            )
          }
        >
          <DelayCauseBars
            data={rangeData ?? []}
            startDate={startDate}
            endDate={endDate}
            focus={focus}
            onFocus={setFocus}
          />
        </Widget>
        <Widget
          title="How the causes changed"
          subtitle={
            stackMode === 'share'
              ? `Detail: each ${period} as a share of all delay time. Periods with very little delay are left blank.`
              : `Detail: each cause over time, in minutes per ${period}`
          }
          ready={[alertDelays]}
          action={stackModeControl}
        >
          <DelayBreakdownGraph
            data={delayData ?? []}
            series={series}
            mode={stackMode}
            startDate={startDate}
            endDate={endDate}
            summary="Delay time by cause over the selected dates"
            agg={agg}
          />
        </Widget>
        <DataNotes>
          <p>
            When there's a delay on the T, the MBTA sends out an alert to riders. These alerts
            almost always include a reason for the delay, and an estimate of how long trains may be
            delayed: "delays of about 15 minutes" on the subway, or "operating 10-20 minutes behind
            schedule" for a Commuter Rail train. We collect these alerts, group them by general
            matching categories, and add up the delay time for each day or week. Over more than two
            years, each bar is a month instead: each week's delay is split evenly across its seven
            days, and only months with a full set of data are shown.
          </p>
          {line === 'line-bus' && (
            <p>
              Bus alerts are posted per route, and most of them cite traffic. A grouped route adds
              up the alerts for each route in it, so an alert covering two of them counts twice.
            </p>
          )}
          <div>
            <h4 className="font-semibold">How we measure delay time</h4>
            <p>
              On subway lines and bus routes, delay time is how long the delay alerts were actually
              up, from when the MBTA posted each one until it was taken down. Overlapping alerts are
              only counted once in the total, and an alert is counted for at most 3 hours, since
              longer ones were almost always left up by mistake. Alerts usually stay up longer than
              the delay they state, because they cover the time it takes service to recover: a "15
              minute" subway alert is typically up for about 35 minutes. Hover over a bar to compare
              the two: "MBTA's estimate" is the delay the alerts stated.
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
              Alerts come from the MBTA's{' '}
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
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
