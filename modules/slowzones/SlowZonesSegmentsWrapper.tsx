import type dayjs from 'dayjs';
import React from 'react';
import { SZWidgetValue } from '../../common/types/basicWidgets';
import type { Direction, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';
import {
  useFilteredAllSlow,
  useFormatSegments,
  useSlowZoneQuantityDelta,
} from '../../common/utils/slowZoneUtils';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { todayOrDate } from '../../common/constants/dates';
import { LineSegments } from './charts/LineSegments';

interface SlowZonesSegmentsWrapper {
  data: SlowZoneResponse[];
  lineShort: LineShort;
  endDateUTC: dayjs.Dayjs;
  startDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const SlowZonesSegmentsWrapper: React.FC<SlowZonesSegmentsWrapper> = ({
  data,
  lineShort,
  endDateUTC,
  startDateUTC,
  direction,
}) => {
  const filteredAllSlow = useFilteredAllSlow(data, startDateUTC, endDateUTC, lineShort);
  const allSlowGraphData = useFormatSegments(filteredAllSlow, startDateUTC, direction);
  const { endValue, zonesDelta } = useSlowZoneQuantityDelta(
    allSlowGraphData,
    endDateUTC,
    startDateUTC
  );

  return (
    <>
      <BasicWidgetDataLayout
        widgetValue={new SZWidgetValue(endValue, zonesDelta)}
        title={todayOrDate(endDateUTC)}
        analysis={'over period'}
      />
      <div className="relative flex">
        <LineSegments
          data={allSlowGraphData}
          line={lineShort}
          startDateUTC={startDateUTC}
          endDateUTC={endDateUTC}
          direction={direction}
        />
      </div>
    </>
  );
};
