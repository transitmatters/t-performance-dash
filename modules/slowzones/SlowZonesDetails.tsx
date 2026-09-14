'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import Link from 'next/link';
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
import { Layout } from '../../common/layouts/layoutTypes';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import { BetaSlowZoneDataNotice } from '../../common/components/notices/BetaSlowZoneDataNotice';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
import { DirectionObject } from './constants/constants';
import { getSlowZoneStats } from './utils';

dayjs.extend(utc);

const DIRECTION_OPTIONS = Object.entries(DirectionObject) as [Direction, string][];

export function SlowZonesDetails() {
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound' as Direction,
    DIRECTION_OPTIONS
  );

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
    return <p>Select a date range to load graphs.</p>;
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
      label: `${sign}${getFormattedTimeString(Math.abs(deltaSeconds))} · ${word}`,
      sentiment,
    };
  };
  const zonesDeltaBadge = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = delta === 0 ? 'flat' : delta < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    return { label: `${delta > 0 ? '+' : ''}${delta} · ${word}`, sentiment };
  };

  return (
    <PageWrapper pageTitle={'Slow zones'}>
      <ChartPageDiv>
        <BetaSlowZoneDataNotice />
        {stats && Number.isFinite(stats.currentSlowTime) && (
          <StatCardGrid>
            <StatCard
              label="Current slow time"
              value={getFormattedTimeString(stats.currentSlowTime)}
              delta={timeDeltaBadge(stats.slowTimeDelta)}
            />
            <StatCard
              label="Active slow zones"
              value={`${stats.activeZones}`}
              unit="zones"
              delta={zonesDeltaBadge(stats.zonesDelta)}
            />
            <StatCard
              label="Worst segment"
              value={stats.worstSegment ? stats.worstSegment.title : '—'}
              unit={
                stats.worstSegment ? getFormattedTimeString(stats.worstSegment.delay) : undefined
              }
            />
          </StatCardGrid>
        )}
        <Widget
          title="Total slow time"
          subtitle={
            <Link href="https://transitmatters.org/blog/slowzonesupdate" target="_blank">
              Time over baseline across the line
            </Link>
          }
          ready={[delayTotals, line]}
        >
          {isRapidTransit && line ? (
            <TotalSlowTimeWrapper
              data={delayTotals.data!.data}
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
          title="Line map"
          subtitle={`As of ${formatDateTodayCheck(endDate!)}`}
          ready={[allSlow, speedRestrictions]}
        >
          {canShowSlowZonesMap ? (
            <SlowZonesMap
              key={lineShort}
              slowZones={allSlow.data!}
              speedRestrictions={speedRestrictions.data!}
              lineName={lineShort}
              direction={isDesktop ? 'horizontal' : 'vertical'}
            />
          ) : (
            <NoDataNotice isLineMetric />
          )}
        </Widget>
        <Widget
          title={`${DirectionObject[direction]} segments`}
          subtitle="Time over baseline, by segment"
          action={directionControl}
          ready={[allSlow]}
        >
          <SlowZonesSegmentsWrapper
            data={Array.isArray(allSlow.data) ? allSlow.data : allSlow.data!.data}
            lineShort={lineShort}
            linePath={linePath}
            endDateUTC={endDateUTC}
            startDateUTC={startDateUTC}
            direction={direction}
          />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

SlowZonesDetails.Layout = Layout.Dashboard;
