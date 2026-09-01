'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import Link from 'next/link';
import { isArray } from 'lodash';
import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { StatCard, type StatSentiment } from '../../common/components/widgets/StatCard';
import { getFormattedTimeString } from '../../common/utils/time';
import type { Direction } from '../../common/types/dataPoints';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { Layout } from '../../common/layouts/layoutTypes';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { BetaSlowZoneDataNotice } from '../../common/components/notices/BetaSlowZoneDataNotice';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
import { DirectionObject } from './constants/constants';
import { SlowZonesWidgetTitle } from './SlowZonesWidgetTitle';
import { getSlowZoneStats } from './utils';

dayjs.extend(utc);

export function SlowZonesDetails() {
  const [direction, setDirection] = useState<Direction>('northbound');

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
  const totalSlowTimeReady =
    !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC && lineShort && line;
  const segmentsReady = !allSlow.isError && allSlow.data && startDateUTC && lineShort;
  const canShowSlowZonesMap =
    lineShort === 'Red' ||
    lineShort === 'Blue' ||
    lineShort === 'Orange' ||
    lineShort === 'Green' ||
    lineShort === 'Mattapan';
  const isDesktop = useBreakpoint('lg');

  if (!endDateUTC || !startDateUTC) {
    return (
      <p>
        Select a date <b>range</b> to load Slow Zone graphs.
      </p>
    );
  }

  const stats =
    totalSlowTimeReady &&
    segmentsReady &&
    delayTotals.data &&
    allSlow.data &&
    lineShort !== 'Commuter Rail' &&
    lineShort !== 'Bus'
      ? getSlowZoneStats(
          delayTotals.data.data,
          isArray(allSlow.data) ? allSlow.data : allSlow.data.data,
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          </div>
        )}
        <WidgetDiv>
          <WidgetTitle title="Total slow time" />
          <Link
            href="https://transitmatters.org/blog/slowzonesupdate"
            target="_blank"
            className="text-sm whitespace-nowrap text-stone-600 italic"
          >
            Time over Baseline across Line
          </Link>

          <div className="relative flex flex-col">
            {totalSlowTimeReady && lineShort !== 'Commuter Rail' && lineShort !== 'Bus' ? (
              <TotalSlowTimeWrapper
                data={delayTotals.data.data}
                startDateUTC={startDateUTC}
                endDateUTC={endDateUTC}
                line={line}
                lineShort={lineShort}
                showWidgetValue={false}
              />
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={delayTotals} />
              </div>
            )}
          </div>
        </WidgetDiv>
        <WidgetDiv>
          <SlowZonesWidgetTitle />
          <div className="relative flex flex-col">
            {allSlow.data && speedRestrictions.data && canShowSlowZonesMap ? (
              <SlowZonesMap
                key={lineShort}
                slowZones={allSlow.data}
                speedRestrictions={speedRestrictions.data}
                lineName={lineShort}
                direction={isDesktop ? 'horizontal' : 'vertical'}
              />
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={delayTotals} />
              </div>
            )}
          </div>
        </WidgetDiv>
        {/* Not Using WidgetDiv here - removed the padding so the chart goes to the edge of the widget on mobile. */}
        <div className="shadow-dataBox h-full rounded-lg bg-white p-0 sm:p-4">
          <div className="flex flex-col p-4 sm:p-0 lg:flex-row">
            <WidgetTitle title={`${DirectionObject[direction]} segments`} />
            <div className="lg:ml-2">
              <ButtonGroup pressFunction={setDirection} options={Object.entries(DirectionObject)} />
            </div>
          </div>
          <div className="relative flex flex-col">
            {segmentsReady ? (
              <SlowZonesSegmentsWrapper
                data={isArray(allSlow.data) ? allSlow.data : allSlow.data.data}
                lineShort={lineShort}
                linePath={linePath}
                endDateUTC={endDateUTC}
                startDateUTC={startDateUTC}
                direction={direction}
              />
            ) : (
              <ChartPlaceHolder query={allSlow} />
            )}
          </div>
        </div>
      </ChartPageDiv>
    </PageWrapper>
  );
}

SlowZonesDetails.Layout = Layout.Dashboard;
