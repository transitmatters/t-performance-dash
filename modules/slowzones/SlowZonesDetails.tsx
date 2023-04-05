'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useQuery } from '@tanstack/react-query';

import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { fetchAllSlow, fetchDelayTotals, fetchSpeedRestrictions } from './api/slowzones';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';

dayjs.extend(utc);

export default function SlowZonesDetails() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const speedRestrictions = useQuery(['speedRestrictions'], fetchSpeedRestrictions);
  const {
    lineShort,
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;
  const totalSlowTimeReady =
    !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC && lineShort && line;
  const segmentsReady = !allSlow.isError && allSlow.data && startDateUTC && lineShort;
  const canShowSlowZonesMap = lineShort === 'Red' || lineShort === 'Blue' || lineShort === 'Orange';

  if (!endDateUTC || !startDateUTC) {
    return (
      <p>
        Select a date <b>range</b> to load Slow Zone graphs.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        {/* TODO: display current total when a range is not selected. */}
        <WidgetTitle title="Total delays" />
        <div className="relative flex flex-col">
          {totalSlowTimeReady ? (
            <TotalSlowTimeWrapper
              data={delayTotals.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              line={line}
              lineShort={lineShort}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={delayTotals} />
            </div>
          )}
        </div>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <WidgetTitle title="Line Map" />
        <div className="relative flex flex-col">
          {allSlow.data && speedRestrictions.data && canShowSlowZonesMap ? (
            <SlowZonesMap
              slowZones={allSlow.data}
              speedRestrictions={speedRestrictions.data}
              lineName={lineShort}
              direction="horizontal-on-desktop"
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={delayTotals} />
            </div>
          )}
        </div>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <WidgetTitle title="Locations" />
        <div className="relative flex flex-col">
          {segmentsReady ? (
            <SlowZonesSegmentsWrapper
              data={allSlow.data}
              lineShort={lineShort}
              endDateUTC={endDateUTC}
              startDateUTC={startDateUTC}
            />
          ) : (
            <ChartPlaceHolder query={allSlow} />
          )}
        </div>
      </div>
    </div>
  );
}
