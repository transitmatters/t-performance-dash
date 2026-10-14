'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'react-i18next';
import { i18n } from '../../../common/i18n';
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
  label: i18n.t('service:regionalRail.waitTarget', { minutes: TARGET_HEADWAY_MINUTES }),
  value: TARGET_HEADWAY_MINUTES,
  goodSide: 'below' as const,
};

const HOURLY_AXIS = {
  title: i18n.t('service:regionalRail.hourly.axis'),
  tooltipItemLabel: i18n.t('service:regionalRail.hourly.unit'),
};

/** Commuter Rail's scheduled service, measured against TransitMatters' Regional Rail standards. */
export function CommuterRailService() {
  const { t } = useTranslation(['service', 'common']);
  const {
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();
  const lineName = crRoute ? COMMUTER_RAIL_LINE_NAMES[crRoute] : undefined;
  const { value: scope, control: scopeControl } = useChartToggle(
    'route',
    [
      ['route', t('regionalRail.scope.thisLine')],
      ['all', t('regionalRail.scope.allLines')],
    ],
    { paramKey: 'serviceScope' }
  );
  const { value: dayKind, control: dayKindControl } = useChartToggle(
    'weekday' as const,
    [
      ['weekday', t('dayKind.weekday')],
      ['saturday', t('dayKind.saturday')],
      ['sunday', t('dayKind.sunday')],
    ],
    { paramKey: 'day' }
  );
  const byLine = scope === 'route' && Boolean(crRoute);
  const { agg } = React.useMemo(
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
  const hourly = React.useMemo(
    () =>
      DIRECTIONS.map(({ key, label }) => ({
        label,
        data: averageByHour(scorecard.data ?? [], key),
        style: { color: DIRECTION_COLORS[key] },
      })),
    [scorecard.data]
  );

  if (!startDate || !endDate) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  const data = scorecard.data ?? [];
  const stats = byLine && scorecard.data ? getScorecardStats(scorecard.data) : null;
  const ready = [scorecard];
  // Typed so the per-day catalog keys below resolve statically.
  const day: DayKind = dayKind;
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
    <PageWrapper
      pageTitle={t('regionalRail.pageTitle', {
        scope: byLine ? lineName : t('regionalRail.scope.allLines'),
      })}
    >
      <ChartPageDiv>
        <div className="flex flex-wrap justify-end gap-2">
          {crRoute && scopeControl}
          {dayKindControl}
        </div>
        {stats && (
          <StatCardGrid>
            <StatCard
              label={t('regionalRail.trainsPerDay')}
              value={formatCount(stats.tripsPerDay)}
              unit={t('regionalRail.stats.bothWays')}
            />
            <StatCard
              label={t('regionalRail.stats.hoursAtTarget')}
              value={formatCount(stats.hoursAtTarget)}
              unit={t('regionalRail.stats.ofHours', { total: SPAN_HOURS })}
              delta={
                stats.hoursAtTarget != null
                  ? {
                      label:
                        hoursTone(stats.hoursAtTarget) === 'meets'
                          ? t('regionalRail.stats.meets')
                          : t('regionalRail.stats.hoursShort', {
                              hours: SPAN_HOURS - Math.round(stats.hoursAtTarget),
                            }),
                      sentiment: TONE_SENTIMENT[hoursTone(stats.hoursAtTarget)],
                    }
                  : undefined
              }
            />
            <StatCard
              label={t('regionalRail.middayWait')}
              value={formatMinutes(stats.maxGapMidday)}
              delta={
                stats.maxGapMidday != null
                  ? {
                      label:
                        waitTone(stats.maxGapMidday) === 'meets'
                          ? t('regionalRail.stats.meets')
                          : t('regionalRail.stats.tooLong', {
                              wait: formatMinutes(stats.maxGapMidday - TARGET_HEADWAY_MINUTES),
                            }),
                      sentiment: TONE_SENTIMENT[waitTone(stats.maxGapMidday)],
                    }
                  : undefined
              }
            />
            <StatCard
              label={t('regionalRail.stats.clockFace')}
              value={formatShare(stats.clockFaceShare)}
              delta={
                stats.clockFaceShare != null
                  ? {
                      label:
                        clockFaceTone(stats.clockFaceShare) === 'meets'
                          ? t('regionalRail.stats.regular')
                          : t('regionalRail.stats.irregular'),
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
              title={t('regionalRail.hoursAtTarget.title')}
              subtitle={t(`regionalRail.hoursAtTarget.subtitle.${day}`, { hours: SPAN_HOURS })}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('hoursAtTarget')}
                valueAxisLabel={t('regionalRail.hoursAtTarget.axis')}
                format={(v) =>
                  t('regionalRail.hoursAtTarget.value', { value: v.toFixed(1), total: SPAN_HOURS })
                }
                max={SPAN_HOURS}
                benchmark={{
                  label: t('regionalRail.hoursAtTarget.target', { hours: SPAN_HOURS }),
                  value: SPAN_HOURS,
                  goodSide: 'above',
                }}
              />
            </Widget>
            <Widget
              title={t('regionalRail.middayWait')}
              subtitle={t(`regionalRail.middaySubtitle.${day}`)}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('maxGapMidday')}
                valueAxisLabel={t('common:chartUnits.minutes')}
                format={formatMinutes}
                benchmark={WAIT_TARGET}
              />
            </Widget>
            <Widget
              title={t('regionalRail.eveningWait')}
              subtitle={t(`regionalRail.eveningSubtitle.${day}`)}
              ready={ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={directionLines('maxGapEvening')}
                valueAxisLabel={t('common:chartUnits.minutes')}
                format={formatMinutes}
                benchmark={WAIT_TARGET}
              />
            </Widget>
            <Widget
              title={t('regionalRail.trainsPerDay')}
              subtitle={bars ? t('regionalRail.everyDay') : t(`regionalRail.onDay.${day}`)}
              ready={bars ? [everyDay] : ready}
            >
              <ScorecardGraph
                {...graphProps}
                data={[
                  ...directionLines('trips', tripsData, bars),
                  {
                    label: t('regionalRail.reversePeak'),
                    data: toPoints(tripsData, (entry) => entry.reversePeakTrips),
                    style: { color: CHART_COLORS.YELLOW, width: 1, bar: bars },
                  },
                ]}
                valueAxisLabel={t('regionalRail.trainsAxis')}
                format={(v) => t('regionalRail.trainsValue', { value: Math.round(v) })}
              />
            </Widget>
            <Widget
              title={t('regionalRail.byHour.title')}
              subtitle={t(`regionalRail.byHour.subtitle.${day}`)}
              ready={ready}
            >
              <ChartStack>
                <ByHourHistogram data={hourly} valueAxis={HOURLY_AXIS} />
              </ChartStack>
            </Widget>
          </>
        ) : (
          <Widget
            title={t('regionalRail.table.title')}
            subtitle={t(`regionalRail.table.subtitle.${day}`)}
            ready={ready}
          >
            <ScorecardTable data={data} />
          </Widget>
        )}
        <DataNotes>
          <p>
            <Trans
              t={t}
              i18nKey="regionalRail.notes.vision"
              components={{
                reports: (
                  <Link href={REGIONAL_RAIL_URL} rel="noopener noreferrer" target="_blank" />
                ),
              }}
            />
          </p>
          <p>{t('regionalRail.notes.method')}</p>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
