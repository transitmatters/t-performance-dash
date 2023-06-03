'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import type { Direction } from '../../common/types/dataPoints';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { SlowZonesSegmentsWrapper } from './SlowZonesSegmentsWrapper';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
import { SlowZonesMap } from './map';
import { DirectionObject } from './constants/constants';
dayjs.extend(utc);

export function SlowZonesDetails() {
  const delayTotals = useSlowzoneDelayTotalData();
  const [direction, setDirection] = useState<Direction>('northbound');
  const allSlow = useSlowzoneAllData();
  const speedRestrictions = useSpeedRestrictionData();
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
    <PageWrapper pageTitle={'Slow Zones'}>
      <div className="flex flex-col gap-4">
        <WidgetDiv>
          <WidgetTitle title="Total Slow Time" />
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
            {allSlow.data && speedRestrictions.data && canShowSlowZonesMap ? (
              <SlowZonesMap
                key={lineShort}
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
        </WidgetDiv>
        {/* Not Using WidgetDiv here - removed the padding so the chart goes to the edge of the widget on mobile. */}
        <div className="h-full rounded-lg bg-white p-0 shadow-dataBox sm:p-4">
          <div className="flex flex-col p-4 sm:p-0 md:flex-row">
            <WidgetTitle title={`${DirectionObject[direction]} Segments`} />
            <div className="ml-2">
              <ButtonGroup pressFunction={setDirection} options={Object.entries(DirectionObject)} />
            </div>
          </div>
          <div className="relative flex flex-col">
            {segmentsReady ? (
              <SlowZonesSegmentsWrapper
                data={allSlow.data}
                lineShort={lineShort}
                endDateUTC={endDateUTC}
                startDateUTC={startDateUTC}
                direction={direction}
              />
            ) : (
              <ChartPlaceHolder query={allSlow} />
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
