import type dayjs from 'dayjs';
import React from 'react';
import type { Direction, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LinePath, LineShort } from '../../common/types/lines';
import { useFilteredAllSlow, useFormatSegments } from '../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ChartStack } from '../../common/components/charts/ChartStack';
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
  const stationPairs = new Set(allSlowGraphData.map((dataPoint) => dataPoint.id));
  return (
    <ChartStack>
      {/* On mobile the strip scrolls sideways, so it bleeds to the card edge rather than
          stopping at the padding. */}
      <div className="-mx-3 overflow-x-auto overflow-y-hidden px-3 sm:mx-0 sm:px-0">
        <div
          className="relative"
          style={
            isMobile
              ? { width: stationPairs.size * 64, height: 480 }
              : { height: stationPairs.size * 40 }
          }
        >
          <LineSegments
            data={allSlowGraphData}
            linePath={linePath}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            direction={direction}
          />
        </div>
      </div>
    </ChartStack>
  );
};
