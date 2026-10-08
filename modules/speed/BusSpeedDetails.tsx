'use client';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { Widget } from '../../common/components/widgets';
import { getBusRouteIds } from '../../common/constants/lines';
import { DAY_FILTER_OPTIONS, useChartToggle } from '../../common/hooks/useChartToggle';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../common/utils/router';
import { TIME_BANDS } from '../busspeedmap/constants';
import type { DayType, TimeBand } from '../busspeedmap/types';
import { getSpeedGraphConfig } from './constants/speeds';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

// The Speed Map's own bands, "All day" included, so the graph and the map filter alike.
const TIME_BAND_OPTIONS = TIME_BANDS.map(({ key, label }) => [key, label] as [TimeBand, string]);

// Split by the day_type each daily row carries, from MBTA's holiday calendar -- the same split
// the Speed Map's weekly/monthly tiles use.
const DAY_TYPE_PARAM: Record<(typeof DAY_FILTER_OPTIONS)[number][0], DayType | undefined> = {
  all: undefined,
  weekday: 'business_day',
  weekend: 'weekend_or_holiday',
};

export function BusSpeedDetails() {
  const {
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();
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
  const { value: timeBand, control: timeBandControl } = useChartToggle(
    'all_day',
    TIME_BAND_OPTIONS,
    { paramKey: 'speedBand' }
  );
  const dayType = DAY_TYPE_PARAM[dayFilter];

  const enabled = Boolean(startDate && endDate && busRoute);
  const speeds = useBusTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      // Grouped labels (e.g. 114/116/117) are summed server-side across their route_ids.
      route: busRoute ? getBusRouteIds(busRoute).join(',') : undefined,
      agg: config.agg,
      // Only sent when narrowing: "All day" and "All days" are the unfiltered figures, so the
      // default view makes exactly the request it always has.
      ...(timeBand !== 'all_day' && { time_band: timeBand }),
      ...(dayType && { day_type: dayType }),
    },
    enabled
  );

  const band = timeBand !== 'all_day' ? TIME_BANDS.find(({ key }) => key === timeBand) : undefined;
  const subtitle = [
    dayType && DAY_FILTER_OPTIONS.find(([key]) => key === dayFilter)?.[1],
    band && `${band.label} · ${band.hours}`,
  ]
    .filter(Boolean)
    .join(' · ');

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        <BusDataNotice />
        <Widget
          title="Speed"
          subtitle={subtitle || undefined}
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {dayFilterControl}
              {timeBandControl}
            </div>
          }
          ready={[speeds]}
        >
          {/* A period with no traversals in the chosen band comes back as zeros, which the
              graph draws as a gap. */}
          <SpeedGraphWrapper
            data={speeds.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
