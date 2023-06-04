import type dayjs from 'dayjs';
import React from 'react';
import { SZWidgetValue } from '../../common/types/basicWidgets';
import type { Direction, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LinePath, LineShort } from '../../common/types/lines';
import {
  useFilteredAllSlow,
  useFormatSegments,
  useSlowZoneQuantityDelta,
} from '../../common/utils/slowZoneUtils';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { todayOrDate } from '../../common/constants/dates';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { LineSegments } from './charts/LineSegments';

interface SlowZonesSegmentsWrapper {
  data: SlowZoneResponse[];
  lineShort: LineShort;
  linePath: LinePath;
  endDateUTC: dayjs.Dayjs;
  startDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const SlowZonesSegmentsWrapper: React.FC<SlowZonesSegmentsWrapper> = ({
  data,
  lineShort,
  linePath,
  endDateUTC,
  startDateUTC,
  direction,
}) => {
  const filteredAllSlow = useFilteredAllSlow(data, startDateUTC, endDateUTC, lineShort);
  const allSlowGraphData = useFormatSegments(filteredAllSlow, startDateUTC, direction);
  const isMobile = !useBreakpoint('sm');
  const { endValue, zonesDelta } = useSlowZoneQuantityDelta(
    allSlowGraphData,
    endDateUTC,
    startDateUTC
  );
  const stationPairs = new Set(allSlowGraphData.map((dataPoint) => dataPoint.id));
  return (
    <>
      <BasicWidgetDataLayout
        widgetValue={new SZWidgetValue(endValue, zonesDelta)}
        title={todayOrDate(endDateUTC)}
        analysis={'over period'}
      />
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div
          className="relative ml-2 sm:ml-0"
          style={
            isMobile
              ? { width: stationPairs.size * 64, height: 480 }
              : { height: stationPairs.size * 40 }
          }
        >
          <LineSegments
            data={allSlowGraphData}
            line={lineShort}
            linePath={linePath}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            direction={direction}
          />
        </div>
      </div>
    </>
  );
};
