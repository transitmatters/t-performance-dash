import type dayjs from 'dayjs';
import React from 'react';
import { DeltaZonesWidgetValue, SZWidgetValue } from '../../common/types/basicWidgets';
import type { Direction, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LinePath, LineShort } from '../../common/types/lines';
import {
  useFilteredAllSlow,
  useFormatSegments,
  useSlowZoneQuantityDelta,
} from '../../common/utils/slowZoneUtils';
import { todayOrDate } from '../../common/constants/dates';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
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
    <div className="pb-4 pl-4 sm:pb-0 sm:pl-0">
      <CarouselGraphDiv>
        <WidgetCarousel>
          <WidgetForCarousel
            widgetValue={new SZWidgetValue(endValue)}
            layoutKind="no-delta"
            analysis={`Current (${todayOrDate(endDateUTC)})`}
          />
          <WidgetForCarousel
            widgetValue={new DeltaZonesWidgetValue(endValue, zonesDelta)}
            analysis={'Change over period'}
            layoutKind="no-delta"
          />
        </WidgetCarousel>
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
              linePath={linePath}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              direction={direction}
            />
          </div>
        </div>
      </CarouselGraphDiv>
    </div>
  );
};
