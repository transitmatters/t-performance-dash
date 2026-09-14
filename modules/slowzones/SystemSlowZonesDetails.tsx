import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import Link from 'next/link';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Widget } from '../../common/components/widgets';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { filterAllSlow, formatSegments } from '../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import type { Direction } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { LineSegments } from './charts/LineSegments';
import { DirectionObject } from './constants/constants';
import { SlowZonesMap } from './map';
import type { SlowZonesLineName } from './types';

interface SystemSlowZonesDetailsProps {
  showTitle?: boolean;
}

const DIRECTION_OPTIONS = Object.entries(DirectionObject) as [Direction, string][];
const LINE_OPTIONS: [SlowZonesLineName, string][] = [
  ['Red', 'Red'],
  ['Orange', 'Orange'],
  ['Blue', 'Blue'],
  ['Green', 'Green'],
  ['Mattapan', 'Mattapan'],
];

export function SystemSlowZonesDetails({ showTitle = false }: SystemSlowZonesDetailsProps) {
  const delayTotals = useSlowzoneDelayTotalData();
  const allData = useSlowzoneAllData();
  const isMobile = !useBreakpoint('sm');
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound' as Direction,
    DIRECTION_OPTIONS
  );

  const [lineShort, setLineShort] = useState<SlowZonesLineName>('Red');
  const line = `line-${lineShort.toLowerCase()}` as Line;
  const isDesktop = useBreakpoint('lg');

  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const speedRestrictions = useSpeedRestrictionData({ lineId: line, date: endDate! });

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;

  const graphData = useMemo(() => {
    if (allData.data && startDateUTC && endDateUTC) {
      const fitleredData = filterAllSlow(
        Array.isArray(allData.data) ? allData.data : allData.data.data,
        startDateUTC,
        endDateUTC
      );
      return formatSegments(fitleredData, startDateUTC, direction);
    } else return [];
  }, [allData.data, endDateUTC, startDateUTC, direction]);

  const stationPairs = new Set(graphData.map((dataPoint) => dataPoint.id));

  if (!endDateUTC || !startDateUTC) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Slow zones'}>
      <ChartPageDiv>
        <Widget
          title="Total slow time"
          subtitle={
            <Link href="https://transitmatters.org/blog/slowzonesupdate" target="_blank">
              Time over baseline across the line
            </Link>
          }
          ready={[delayTotals]}
        >
          {delayTotals.data && (
            <TotalSlowTime
              data={Array.isArray(delayTotals.data) ? delayTotals.data : delayTotals.data.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              showTitle={showTitle}
            />
          )}
        </Widget>
        <Widget
          title="Line map"
          subtitle={`As of ${formatDateTodayCheck(endDate!)}`}
          action={
            <ButtonGroup
              line={line}
              pressFunction={setLineShort}
              selectedIndex={LINE_OPTIONS.findIndex(([key]) => key === lineShort)}
              options={LINE_OPTIONS}
              additionalDivClass="w-auto"
              additionalButtonClass="px-3"
            />
          }
          ready={[allData, speedRestrictions]}
        >
          <SlowZonesMap
            key={lineShort}
            slowZones={allData.data!}
            speedRestrictions={speedRestrictions.data!}
            lineName={lineShort}
            direction={isDesktop ? 'horizontal' : 'vertical'}
          />
        </Widget>
        <Widget
          title={`${DirectionObject[direction]} segments`}
          subtitle="Time over baseline, by segment"
          action={directionControl}
          ready={[allData]}
        >
          <ChartStack>
            {/* On mobile the strip scrolls sideways, so it bleeds to the card edge rather than
                stopping at the padding. */}
            <div className="-mx-3 overflow-x-auto overflow-y-hidden px-3 sm:mx-0 sm:px-0">
              <div
                style={
                  isMobile
                    ? { width: stationPairs.size * 64, height: 480 }
                    : { height: stationPairs.size * 40 }
                }
              >
                <LineSegments
                  data={graphData}
                  startDateUTC={startDateUTC}
                  endDateUTC={endDateUTC}
                  direction={direction}
                />
              </div>
            </div>
          </ChartStack>
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

SystemSlowZonesDetails.Layout = Layout.Dashboard;
