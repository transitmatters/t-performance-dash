'use client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { Link } from '../../common/components/general/Link';
import { useDateRange, useLinePage } from '../../common/hooks/usePageParams';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSlowzoneZoneDelays,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { getFormattedTimeString } from '../../common/utils/time';
import type { Direction } from '../../common/types/dataPoints';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import { GreenLineSlowZoneNotice } from '../../common/components/notices/GreenLineSlowZoneNotice';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
import { DirectionObject } from './constants/constants';
import { getSlowZoneStats, slowTimeBadge, zonesBadge } from './utils';

dayjs.extend(utc);

const DIRECTION_OPTIONS = Object.entries(DirectionObject) as [Direction, string][];

export function SlowZonesDetails() {
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound',
    DIRECTION_OPTIONS
  );

  const { lineShort, linePath, line } = useLinePage();
  const { startDate, endDate } = useDateRange();

  const delayTotals = useSlowzoneDelayTotalData();
  const allSlow = useSlowzoneAllData();
  const zoneDelays = useSlowzoneZoneDelays(lineShort);
  const speedRestrictions = useSpeedRestrictionData({ lineId: line, date: endDate });

  const startDateUTC = dayjs.utc(startDate).startOf('day');
  const endDateUTC = dayjs.utc(endDate).startOf('day');
  const canShowSlowZonesMap =
    lineShort === 'Red' ||
    lineShort === 'Blue' ||
    lineShort === 'Orange' ||
    lineShort === 'Green' ||
    lineShort === 'Mattapan';
  const isDesktop = useBreakpoint('lg');

  const isRapidTransit = lineShort !== 'Commuter Rail' && lineShort !== 'Bus';
  const stats =
    delayTotals.data && allSlow.data && isRapidTransit
      ? getSlowZoneStats(delayTotals.data.data, allSlow.data, startDateUTC, endDateUTC, lineShort)
      : null;

  return (
    <>
      <ChartPageDiv>
        <GreenLineSlowZoneNotice />
        {stats && Number.isFinite(stats.currentSlowTime) && (
          <StatCardGrid>
            <StatCard
              label="Current slow time"
              value={getFormattedTimeString(stats.currentSlowTime)}
              delta={slowTimeBadge(stats)}
            />
            <StatCard
              label="Active slow zones"
              value={`${stats.activeZones}`}
              unit="zones"
              delta={zonesBadge(stats)}
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
          ready={[delayTotals]}
        >
          {/* Children are built before Widget checks `ready`, so guard the data here too —
              `delayTotals.data!` alone throws on the first client render. */}
          {isRapidTransit && delayTotals.data ? (
            <TotalSlowTimeWrapper
              data={delayTotals.data.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              line={line}
              lineShort={lineShort}
              embedLine={linePath}
            />
          ) : (
            <NoDataNotice isLineMetric />
          )}
        </Widget>
        <Widget
          title="Line map"
          subtitle={`As of ${formatDateTodayCheck(endDate).replace('Today', 'today')}`}
          ready={[allSlow, speedRestrictions]}
        >
          {canShowSlowZonesMap ? (
            <SlowZonesMap
              key={lineShort}
              slowZones={allSlow.data!}
              zoneDelays={zoneDelays.data}
              speedRestrictions={speedRestrictions.data}
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
          {allSlow.data && (
            <SlowZonesSegmentsWrapper
              data={allSlow.data.data}
              lineShort={lineShort}
              linePath={linePath}
              endDateUTC={endDateUTC}
              startDateUTC={startDateUTC}
              direction={direction}
            />
          )}
        </Widget>
      </ChartPageDiv>
    </>
  );
}
