'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';

import { Link } from '../../common/components/general/Link';
import { useDelimitatedRoute } from '../../common/utils/router';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getFormattedTimeString } from '../../common/utils/time';
import type { Direction } from '../../common/types/dataPoints';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import { GreenLineSlowZoneNotice } from '../../common/components/notices/GreenLineSlowZoneNotice';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
import { DirectionObject } from './constants/constants';
import { getSlowZoneStats } from './utils';

dayjs.extend(utc);

const DIRECTION_OPTIONS = Object.entries(DirectionObject) as [Direction, string][];

export function SlowZonesDetails() {
  const { t } = useTranslation(['slowzones', 'common']);
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound',
    DIRECTION_OPTIONS
  );
  // Typed so the per-direction catalog keys resolve statically.
  const segmentsDirection: Direction = direction;

  const {
    lineShort,
    linePath,
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const delayTotals = useSlowzoneDelayTotalData();
  const allSlow = useSlowzoneAllData();
  const speedRestrictions = useSpeedRestrictionData({ lineId: line!, date: endDate! });

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;
  const canShowSlowZonesMap =
    lineShort === 'Red' ||
    lineShort === 'Blue' ||
    lineShort === 'Orange' ||
    lineShort === 'Green' ||
    lineShort === 'Mattapan';
  const isDesktop = useBreakpoint('lg');

  if (!endDateUTC || !startDateUTC) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  const isRapidTransit = lineShort !== 'Commuter Rail' && lineShort !== 'Bus';
  const stats =
    delayTotals.data && allSlow.data && isRapidTransit
      ? getSlowZoneStats(
          delayTotals.data.data,
          Array.isArray(allSlow.data) ? allSlow.data : allSlow.data.data,
          startDateUTC,
          endDateUTC,
          lineShort
        )
      : null;

  const timeDeltaBadge = (deltaSeconds: number) => {
    if (!Number.isFinite(deltaSeconds)) return undefined;
    const sentiment: StatSentiment =
      Math.abs(deltaSeconds) < 60 ? 'flat' : deltaSeconds < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const sign = deltaSeconds > 0 ? '+' : deltaSeconds < 0 ? '−' : '';
    return {
      label: t(`common:stats.delta.${word}`, {
        delta: `${sign}${getFormattedTimeString(Math.abs(deltaSeconds))}`,
      }),
      sentiment,
    };
  };
  const zonesDeltaBadge = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = delta === 0 ? 'flat' : delta < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    return {
      label: t(`common:stats.delta.${word}`, { delta: `${delta > 0 ? '+' : ''}${delta}` }),
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={t('common:pages.slowzones.name')}>
      <ChartPageDiv>
        <GreenLineSlowZoneNotice />
        {stats && Number.isFinite(stats.currentSlowTime) && (
          <StatCardGrid>
            <StatCard
              label={t('stats.currentSlowTime')}
              value={getFormattedTimeString(stats.currentSlowTime)}
              delta={timeDeltaBadge(stats.slowTimeDelta)}
            />
            <StatCard
              label={t('stats.activeZones')}
              value={`${stats.activeZones}`}
              unit={t('stats.zones')}
              delta={zonesDeltaBadge(stats.zonesDelta)}
            />
            <StatCard
              label={t('stats.worstSegment')}
              value={stats.worstSegment ? stats.worstSegment.title : '—'}
              unit={
                stats.worstSegment ? getFormattedTimeString(stats.worstSegment.delay) : undefined
              }
            />
          </StatCardGrid>
        )}
        <Widget
          title={t('totalSlowTime')}
          subtitle={
            <Link href="https://transitmatters.org/blog/slowzonesupdate" target="_blank">
              {t('totalSlowTimeSubtitle')}
            </Link>
          }
          ready={[delayTotals, line]}
        >
          {/* Children are built before Widget checks `ready`, so guard the data here too —
              `delayTotals.data!` alone throws on the first client render. */}
          {isRapidTransit && line && delayTotals.data ? (
            <TotalSlowTimeWrapper
              data={delayTotals.data.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              line={line}
              lineShort={lineShort}
              showWidgetValue={false}
            />
          ) : (
            <NoDataNotice isLineMetric />
          )}
        </Widget>
        <Widget
          title={t('lineMap')}
          subtitle={t('asOf', { date: formatDateTodayCheck(endDate!) })}
          ready={[allSlow, speedRestrictions]}
        >
          {canShowSlowZonesMap ? (
            <SlowZonesMap
              key={lineShort}
              slowZones={allSlow.data!}
              speedRestrictions={speedRestrictions.data}
              lineName={lineShort}
              direction={isDesktop ? 'horizontal' : 'vertical'}
            />
          ) : (
            <NoDataNotice isLineMetric />
          )}
        </Widget>
        <Widget
          title={t(`segments.title.${segmentsDirection}`)}
          subtitle={t('segments.subtitle')}
          action={directionControl}
          ready={[allSlow]}
        >
          {allSlow.data && (
            <SlowZonesSegmentsWrapper
              data={Array.isArray(allSlow.data) ? allSlow.data : allSlow.data.data}
              lineShort={lineShort}
              linePath={linePath}
              endDateUTC={endDateUTC}
              startDateUTC={startDateUTC}
              direction={direction}
            />
          )}
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
