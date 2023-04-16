'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { useSlowzoneAllData, useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
dayjs.extend(utc);

export default function SlowZonesDetails() {
  const delayTotals = useSlowzoneDelayTotalData();
  const allSlow = useSlowzoneAllData();
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
      <WidgetDiv>
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
      </WidgetDiv>
      <WidgetDiv>
        <WidgetTitle title="Line Map" />
        <div className="relative flex flex-col">
          {allSlow.data && canShowSlowZonesMap ? (
            <SlowZonesMap
              slowZones={allSlow.data}
              lineName={lineShort}
              direction="horizontal-on-desktop"
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={delayTotals} />
            </div>
          )}
        </div>
      </WidgetDiv>
      <WidgetDiv>
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
      </WidgetDiv>
    </div>
  );
}
