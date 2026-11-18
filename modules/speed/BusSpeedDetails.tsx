'use client';

import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { getBusRouteIds } from '../../common/constants/lines';
import { DAY_FILTER_OPTIONS, useChartToggle } from '../../common/hooks/useChartToggle';
import { halvesComparison, statDelta } from '../../common/utils/statDelta';
import { useDelimitatedRoute, useSetQueryParam } from '../../common/utils/router';
import { TIME_BANDS } from '../busspeedmap/constants';
import type { DayType, TimeBand } from '../busspeedmap/types';
import { BusSpeedGraph } from './charts/BusSpeedGraph';
import { getSpeedGraphConfig } from './constants/speeds';
import {
  bandExtremes,
  BUS_SPEED_DATA_START,
  parseVisibleBands,
  serializeVisibleBands,
} from './utils/busSpeedBands';
import { getSpeedStats } from './utils/utils';

// Split by the day_type each daily row carries, from MBTA's holiday calendar -- the same split
// the Speed Map's weekly/monthly tiles use.
const DAY_TYPE_PARAM: Record<(typeof DAY_FILTER_OPTIONS)[number][0], DayType | undefined> = {
  all: undefined,
  weekday: 'business_day',
  weekend: 'weekend_or_holiday',
};

const mph = (value: number) => `${value.toFixed(1)} mph`;
const bandLabel = (band: TimeBand) => TIME_BANDS.find(({ key }) => key === band)?.label ?? band;

export function BusSpeedDetails() {
  const {
    query: { startDate, endDate, busRoute, speedBands },
  } = useDelimitatedRoute();
  const setQueryParam = useSetQueryParam();
  // Same day/week/month thresholds as rail. Bus has no weekly/monthly tables, so the API
  // rolls daily rows up server-side when agg isn't daily.
  const config = useMemo(
    () => getSpeedGraphConfig(dayjs(startDate), dayjs(endDate)),
    [startDate, endDate]
  );
  const { value: dayFilter, control: dayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS,
    { paramKey: 'speedDays' }
  );
  const dayType = DAY_TYPE_PARAM[dayFilter];

  // Which lines are drawn rides in the URL like the filters do: a link to the peaks alone is a
  // different chart from one with every band on.
  const visible = useMemo(() => parseVisibleBands(speedBands), [speedBands]);
  const setVisible = useCallback(
    (next: TimeBand[]) => setQueryParam('speedBands', serializeVisibleBands(next)),
    [setQueryParam]
  );

  const enabled = Boolean(startDate && endDate && busRoute);
  // One request draws every line: each row carries its own per-band breakdown, so toggling a line
  // never fetches again.
  const speeds = useBusTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      // Grouped labels (e.g. 114/116/117) are summed server-side across their route_ids.
      route: busRoute ? getBusRouteIds(busRoute).join(',') : undefined,
      agg: config.agg,
      // Only sent when narrowing: "All days" is the unfiltered figure.
      ...(dayType && { day_type: dayType }),
    },
    enabled
  );

  const subtitle = dayType ? DAY_FILTER_OPTIONS.find(([key]) => key === dayFilter)?.[1] : undefined;
  const hasData = speeds.data?.some((row) => row.miles_covered);
  const stats = hasData ? getSpeedStats(speeds.data!, undefined) : undefined;
  const extremes = hasData ? bandExtremes(speeds.data!) : undefined;
  const startsBeforeData = Boolean(startDate && startDate < BUS_SPEED_DATA_START);

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <>
      <ChartPageDiv>
        <BusDataNotice />
        {stats && Number.isFinite(stats.avgSpeed) && (
          <StatCardGrid>
            <StatCard
              label="Average speed"
              value={stats.avgSpeed.toFixed(1)}
              unit="mph"
              delta={statDelta({
                delta: stats.avgSpeedDelta,
                negligible: 0.2,
                magnitude: `${stats.avgSpeedDelta > 0 ? '+' : ''}${mph(stats.avgSpeedDelta)}`,
                words: ['faster', 'slower'],
                ...halvesComparison(stats.avgSpeedBefore, stats.avgSpeedAfter, mph),
              })}
            />
            <StatCard
              label="Slowest time of day"
              value={extremes ? bandLabel(extremes.slowest.band) : '—'}
              unit={extremes && mph(extremes.slowest.mph)}
            />
            <StatCard
              label="Fastest time of day"
              value={extremes ? bandLabel(extremes.fastest.band) : '—'}
              unit={extremes && mph(extremes.fastest.mph)}
            />
          </StatCardGrid>
        )}
        <Widget
          title="Speed"
          subtitle={subtitle}
          action={<div className="flex flex-wrap justify-end gap-2">{dayFilterControl}</div>}
          ready={[speeds]}
        >
          {hasData ? (
            <>
              <BusSpeedGraph
                data={speeds.data!}
                config={config}
                startDate={startsBeforeData ? BUS_SPEED_DATA_START : startDate}
                endDate={endDate}
                visible={visible}
                onVisibleChange={setVisible}
              />
              {startsBeforeData && (
                <p className="text-xs text-muted-foreground">
                  Bus speed data starts on {dayjs(BUS_SPEED_DATA_START).format('MMMM D, YYYY')}.
                </p>
              )}
            </>
          ) : (
            <NoDataNotice isLineMetric shutdownScope="line" />
          )}
        </Widget>
      </ChartPageDiv>
    </>
  );
}
