'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { useCrScorecard } from '../../../common/api/hooks/crScorecard';
import { PageWrapper } from '../../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../../common/components/charts/ChartPageDiv';
import { Widget } from '../../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../../common/components/widgets/StatCard';
import { useCrServiceScope, useServiceDay } from '../../../common/hooks/usePageFilters';
import { useChartToggle } from '../../../common/hooks/useChartToggle';
import type { DayKind } from '../../../common/types/dataPoints';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { LinesHourGrid } from './LinesHourGrid';
import { RegionalRailNotes } from './RegionalRailNotes';
import { DIRECTION_STYLES, REVERSE_PEAK_STYLE, ScorecardGraph } from './ScorecardGraph';
import { ServicePattern } from './ServicePattern';
import {
  DIRECTIONS,
  SPAN_HOURS,
  TARGET_HEADWAY_MINUTES,
  formatClock,
  formatCount,
  formatMinutes,
  getScorecardStats,
  hoursTone,
  serviceSpan,
  toPoints,
  waitTone,
} from './utils';

// "commuter-rail" asks the API for one summary per line
const ALL_COMMUTER_RAIL = 'commuter-rail';

const DAY_LABELS: Record<DayKind, string> = {
  weekday: 'weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const WAIT_OPTIONS: ['midday' | 'evening', string][] = [
  ['midday', 'Midday'],
  ['evening', 'Evening'],
];

const WAIT_WINDOWS = { midday: '10am to 3pm', evening: '7pm to midnight' };

/** Commuter Rail's scheduled service, measured against TransitMatters' Regional Rail standards. */
export function CommuterRailService() {
  const {
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();
  const lineName = crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : undefined;
  const { value: scope } = useCrServiceScope();
  const { value: dayKind } = useServiceDay();
  const { value: wait, control: waitControl } = useChartToggle('midday', WAIT_OPTIONS, {
    variant: 'toggle',
    paramKey: 'wait',
  });
  const byLine = scope === 'route' && Boolean(crRoute);
  const { agg } = useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );
  const scorecard = useCrScorecard(
    {
      route_id: byLine ? crRoute : ALL_COMMUTER_RAIL,
      start_date: startDate,
      end_date: endDate,
      agg,
      day_kind: dayKind,
    },
    Boolean(startDate && endDate)
  );
  // Trains per day rarely changes from day to day, so short ranges read better as bars, and
  // the bars show every day so weekend service sits next to weekday service
  const bars = agg === 'daily';
  const everyDay = useCrScorecard(
    {
      route_id: crRoute,
      start_date: startDate,
      end_date: endDate,
      agg,
      day_kind: 'all',
    },
    Boolean(startDate && endDate && byLine && bars)
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const data = scorecard.data ?? [];
  const stats = byLine && scorecard.data ? getScorecardStats(scorecard.data) : null;
  const span = byLine && scorecard.data ? serviceSpan(scorecard.data) : null;
  const ready = [scorecard];
  const day = DAY_LABELS[dayKind];
  const tripsData = bars ? (everyDay.data ?? []) : data;
  const waitField = wait === 'evening' ? 'maxGapEvening' : 'maxGapMidday';
  const directionLines = (
    field: 'hoursAtTarget' | 'maxGapMidday' | 'maxGapEvening' | 'trips',
    source = data,
    bar = false
  ) =>
    DIRECTIONS.map(({ key, label }) => ({
      label,
      data: toPoints(source, (entry) => entry[key][field]),
      style: bar ? { color: DIRECTION_STYLES[key].color, bar } : DIRECTION_STYLES[key],
    }));
  const csvRows = (
    field: 'hoursAtTarget' | 'maxGapMidday' | 'maxGapEvening' | 'trips',
    source = data
  ) =>
    source.map((entry) => ({
      date: entry.date,
      outbound: entry.outbound[field],
      inbound: entry.inbound[field],
    }));
  const graphProps = { agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={`Service · ${byLine ? lineName : 'All lines'}`}>
      <ChartPageDiv>
        {stats && span && (
          <StatCardGrid>
            <StatCard
              label="Hours every 30 min"
              value={formatCount(stats.hoursAtTarget)}
              unit={`of ${SPAN_HOURS}`}
              delta={
                stats.hoursAtTarget != null
                  ? {
                      label: `Regional Rail: ${SPAN_HOURS}`,
                      sentiment: hoursTone(stats.hoursAtTarget) === 'meets' ? 'good' : 'flat',
                    }
                  : undefined
              }
            />
            <StatCard
              label="Longest midday wait"
              value={formatMinutes(stats.maxGapMidday)}
              delta={
                stats.maxGapMidday != null
                  ? {
                      label: `Regional Rail: ${TARGET_HEADWAY_MINUTES} min`,
                      sentiment: waitTone(stats.maxGapMidday) === 'meets' ? 'good' : 'flat',
                    }
                  : undefined
              }
            />
            <StatCard
              label="First to last train"
              value={
                span.first != null && span.last != null
                  ? `${formatClock(span.first)} – ${formatClock(span.last)}`
                  : '—'
              }
            />
          </StatCardGrid>
        )}
        {byLine ? (
          <>
            <Widget
              title="When trains run"
              subtitle={`Trains each hour on an average ${day} in this range`}
              ready={ready}
            >
              <ServicePattern
                data={data}
                stats={stats}
                dayLabel={day}
                startDate={startDate}
                endDate={endDate}
              />
            </Widget>
            <Widget
              title="Hours with a train every 30 minutes"
              subtitle={`Of the ${SPAN_HOURS} hours from 5am to 1am, on a ${day} · higher is better`}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                datasetName="cr-hours-at-target"
                data={directionLines('hoursAtTarget')}
                csv={csvRows('hoursAtTarget')}
                valueAxisLabel="Hours"
                format={(v) => `${v.toFixed(1)} of ${SPAN_HOURS} hours`}
                max={SPAN_HOURS}
                benchmark={{
                  label: `Regional Rail: all ${SPAN_HOURS} hours`,
                  value: SPAN_HOURS,
                  goodSide: 'above',
                }}
              />
            </Widget>
            <Widget
              title="Longest wait between trains"
              subtitle={`${WAIT_WINDOWS[wait]}, on a ${day} · lower is better`}
              ready={ready}
              action={waitControl}
            >
              <ScorecardGraph
                {...graphProps}
                datasetName="cr-longest-wait"
                data={directionLines(waitField)}
                csv={csvRows(waitField)}
                valueAxisLabel="Minutes"
                format={formatMinutes}
                benchmark={{
                  label: `Regional Rail: ${TARGET_HEADWAY_MINUTES} min`,
                  value: TARGET_HEADWAY_MINUTES,
                  goodSide: 'below',
                }}
              />
            </Widget>
            <Widget
              title="Trains per day"
              subtitle={bars ? 'Every day' : `On a ${day}`}
              ready={bars ? [everyDay] : ready}
            >
              <ScorecardGraph
                {...graphProps}
                datasetName="cr-trains-per-day"
                data={[
                  ...directionLines('trips', tripsData, bars),
                  {
                    label: 'Reverse peak',
                    data: toPoints(tripsData, (entry) => entry.reversePeakTrips),
                    style: { ...REVERSE_PEAK_STYLE, bar: bars },
                  },
                ]}
                csv={csvRows('trips', tripsData)}
                valueAxisLabel="Trains"
                format={(v) => `${Math.round(v)} trains`}
              />
            </Widget>
          </>
        ) : (
          <Widget
            title="Lines against Regional Rail standards"
            subtitle={`Trains each hour on an average ${day} in this range`}
            ready={ready}
          >
            <LinesHourGrid data={data} dayLabel={day} startDate={startDate} endDate={endDate} />
          </Widget>
        )}
        <RegionalRailNotes />
      </ChartPageDiv>
    </PageWrapper>
  );
}
