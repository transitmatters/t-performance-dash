import dayjs from 'dayjs';
import { useMemo } from 'react';

import { Link } from '../../common/components/general/Link';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSlowzoneZoneDelays,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { useDateRange } from '../../common/hooks/usePageParams';
import { Widget } from '../../common/components/widgets';
import { filterAllSlow, formatSegments } from '../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { useChartToggle, useOption } from '../../common/hooks/useChartToggle';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import type { Line } from '../../common/types/lines';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { LineSegments } from './charts/LineSegments';
import { DIRECTION_OPTIONS, DirectionObject } from './constants/constants';
import { SlowZonesMap } from './map';
import type { SlowZonesLineName } from './types';

interface SystemSlowZonesDetailsProps {
  showTitle?: boolean;
}

const LINE_KEYS: Record<SlowZonesLineName, Line> = {
  Red: 'line-red',
  Orange: 'line-orange',
  Blue: 'line-blue',
  Green: 'line-green',
  Mattapan: 'line-mattapan',
};

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
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound',
    DIRECTION_OPTIONS
  );

  // In the URL, so a link to the map opens on the line it showed
  const { value: lineShort, setValue: setLineShort } = useOption('Red', LINE_OPTIONS, 'mapLine');
  const line = LINE_KEYS[lineShort];
  const isDesktop = useBreakpoint('lg');

  const { startDate, endDate } = useDateRange();

  const speedRestrictions = useSpeedRestrictionData({ lineId: line, date: endDate });
  const zoneDelays = useSlowzoneZoneDelays(lineShort);

  const startDateUTC = dayjs.utc(startDate).startOf('day');
  const endDateUTC = dayjs.utc(endDate).startOf('day');

  const graphData = useMemo(() => {
    if (allData.data) {
      const fitleredData = filterAllSlow(allData.data.data, startDateUTC, endDateUTC);
      return formatSegments(fitleredData, startDateUTC, direction);
    } else return [];
  }, [allData.data, endDateUTC, startDateUTC, direction]);

  return (
    <>
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
              data={delayTotals.data.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              showTitle={showTitle}
              embedLine="system"
            />
          )}
        </Widget>
        <Widget
          title="Line map"
          // The segment tooltip opens above the map and would be cut off by the card
          className="overflow-visible"
          subtitle={`As of ${formatDateTodayCheck(endDate).replace('Today', 'today')}`}
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
            zoneDelays={zoneDelays.data}
            speedRestrictions={speedRestrictions.data}
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
          <LineSegments
            data={graphData}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            direction={direction}
          />
        </Widget>
      </ChartPageDiv>
    </>
  );
}
