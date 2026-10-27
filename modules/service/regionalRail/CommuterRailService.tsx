'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { useCrScorecard } from '../../../common/api/hooks/crScorecard';
import { PageWrapper } from '../../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../../common/components/charts/ChartPageDiv';
import { ByHourHistogram } from '../../../common/components/charts/ByHourHistogram';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { DataNotes } from '../../../common/components/notices/DataNotes';
import { Link } from '../../../common/components/general/Link';
import { Widget } from '../../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../../common/components/widgets/StatCard';
import { CHART_COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { useChartToggle } from '../../../common/hooks/useChartToggle';
import type { DayKind } from '../../../common/types/dataPoints';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { ScorecardGraph } from './ScorecardGraph';
import { ScorecardTable } from './ScorecardTable';
import {
  DIRECTIONS,
  SPAN_HOURS,
  TARGET_HEADWAY_MINUTES,
  averageByHour,
  clockFaceTone,
  formatCount,
  formatMinutes,
  formatShare,
  getScorecardStats,
  hoursTone,
  toPoints,
  waitTone,
} from './utils';
import type { Tone } from './utils';

const REGIONAL_RAIL_URL = 'https://transitmatters.org/regional-rail';

// "commuter-rail" asks the API for one summary per line
const ALL_COMMUTER_RAIL = 'commuter-rail';

const DIRECTION_COLORS = {
  outbound: LINE_COLORS['line-commuter-rail'],
  inbound: CHART_COLORS.BLUE,
};

const TONE_SENTIMENT: Record<Tone, StatSentiment> = { meets: 'good', partway: 'flat', far: 'bad' };

const WAIT_TARGET = {
  label: `Regional Rail: ${TARGET_HEADWAY_MINUTES} min`,
  value: TARGET_HEADWAY_MINUTES,
  goodSide: 'below' as const,
};

const HOURLY_AXIS = { title: 'Scheduled trains', tooltipItemLabel: 'trains' };

const DAY_LABELS: Record<DayKind, string> = {
  weekday: 'weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Commuter Rail's scheduled service, measured against TransitMatters' Regional Rail standards. */
export function CommuterRailService() {
  const {
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();
  const lineName = crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : undefined;
  const { value: scope, control: scopeControl } = useChartToggle(
    'route',
    [
      ['route', 'This line'],
      ['all', 'All lines'],
    ],
    { paramKey: 'serviceScope' }
  );
  const { value: dayKind, control: dayKindControl } = useChartToggle(
    'weekday' as const,
    [
      ['weekday', 'Weekday'],
      ['saturday', 'Saturday'],
      ['sunday', 'Sunday'],
    ],
    { paramKey: 'day' }
  );
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

  // Stable between renders: a new array each time makes the chart redraw and keep resizing
  const hourly = useMemo(
    () =>
      DIRECTIONS.map(({ key, label }) => ({
        label,
        data: averageByHour(scorecard.data ?? [], key),
        style: { color: DIRECTION_COLORS[key] },
      })),
    [scorecard.data]
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const data = scorecard.data ?? [];
  const stats = byLine && scorecard.data ? getScorecardStats(scorecard.data) : null;
  const ready = [scorecard];
  const day = DAY_LABELS[dayKind];
  const tripsData = bars ? (everyDay.data ?? []) : data;
  const directionLines = (
    field: 'hoursAtTarget' | 'maxGapMidday' | 'maxGapEvening' | 'trips',
    source = data,
    bar = false
  ) =>
    DIRECTIONS.map(({ key, label }) => ({
      label,
      data: toPoints(source, (entry) => entry[key][field]),
      style: { color: DIRECTION_COLORS[key], bar },
    }));
  const graphProps = { agg, startDate, endDate };

  return (
    <PageWrapper pageTitle={`Service · ${byLine ? lineName : 'All lines'}`}>
      <ChartPageDiv>
        <div className="flex flex-wrap justify-end gap-2">
          {crRoute && scopeControl}
          {dayKindControl}
        </div>
        {stats && (
          <StatCardGrid>
            <StatCard
              label="Trains per day"
              value={formatCount(stats.tripsPerDay)}
              unit="both ways"
            />
            <StatCard
              label="Hours with a train every 30 min"
              value={formatCount(stats.hoursAtTarget)}
              unit={`of ${SPAN_HOURS}`}
              delta={
                stats.hoursAtTarget != null
                  ? {
                      label:
                        hoursTone(stats.hoursAtTarget) === 'meets'
                          ? 'Meets Regional Rail'
                          : `${SPAN_HOURS - Math.round(stats.hoursAtTarget)} hrs short`,
                      sentiment: TONE_SENTIMENT[hoursTone(stats.hoursAtTarget)],
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
                      label:
                        waitTone(stats.maxGapMidday) === 'meets'
                          ? 'Meets Regional Rail'
                          : `${formatMinutes(stats.maxGapMidday - TARGET_HEADWAY_MINUTES)} too long`,
                      sentiment: TONE_SENTIMENT[waitTone(stats.maxGapMidday)],
                    }
                  : undefined
              }
            />
            <StatCard
              label="Clock-face trains"
              value={formatShare(stats.clockFaceShare)}
              delta={
                stats.clockFaceShare != null
                  ? {
                      label:
                        clockFaceTone(stats.clockFaceShare) === 'meets'
                          ? 'Regular pattern'
                          : 'Irregular pattern',
                      sentiment: TONE_SENTIMENT[clockFaceTone(stats.clockFaceShare)],
                    }
                  : undefined
              }
            />
          </StatCardGrid>
        )}
        {byLine ? (
          <>
            <Widget
              title="Hours with a train every 30 minutes"
              subtitle={`Of the ${SPAN_HOURS} hours from 5am to 1am, on a ${day} · higher is better`}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('hoursAtTarget')}
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
              title="Longest midday wait"
              subtitle={`Longest gap between trains, 10am to 3pm, on a ${day} · lower is better`}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('maxGapMidday')}
                valueAxisLabel="Minutes"
                format={formatMinutes}
                benchmark={WAIT_TARGET}
              />
            </Widget>
            <Widget
              title="Longest evening wait"
              subtitle={`Longest gap between trains, 7pm to midnight, on a ${day} · lower is better`}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('maxGapEvening')}
                valueAxisLabel="Minutes"
                format={formatMinutes}
                benchmark={WAIT_TARGET}
              />
            </Widget>
            <Widget
              title="Trains per day"
              subtitle={bars ? 'Every day' : `On a ${day}`}
              ready={bars ? [everyDay] : ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={[
                  ...directionLines('trips', tripsData, bars),
                  {
                    label: 'Reverse peak',
                    data: toPoints(tripsData, (entry) => entry.reversePeakTrips),
                    style: { color: CHART_COLORS.YELLOW, width: 1, bar: bars },
                  },
                ]}
                valueAxisLabel="Trains"
                format={(v) => `${Math.round(v)} trains`}
              />
            </Widget>
            <Widget
              title="Trains by hour"
              subtitle={`Average ${day} in this range · Regional Rail runs at least 2 an hour`}
              ready={ready}
            >
              <ChartStack>
                <ByHourHistogram data={hourly} valueAxis={HOURLY_AXIS} />
              </ChartStack>
            </Widget>
          </>
        ) : (
          <Widget
            title="Lines against Regional Rail standards"
            subtitle={`Average ${day} in this range · weaker direction`}
            ready={ready}
          >
            <ScorecardTable data={data} />
          </Widget>
        )}
        <DataNotes>
          <p>
            Built from the MBTA&apos;s published schedules, not trains actually run.
            TransitMatters&apos; Regional Rail vision calls for a train at least every 30 minutes in
            both directions, from 5am to 1am, on a repeating hourly pattern riders can memorize.{' '}
            <Link href={REGIONAL_RAIL_URL} rel="noopener noreferrer" target="_blank">
              Read our Regional Rail reports
            </Link>
            .
          </p>
          <p>
            Each direction is measured at its Boston terminal: outbound trains when they leave,
            inbound trains when they arrive. A wait spans the trains on either side of the window,
            so a 7am train followed by a 4pm train counts as a 9-hour midday wait. Clock-face trains
            have another train exactly an hour before or after, within two minutes. Holidays are
            counted with the kind of day they fall on.
          </p>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
