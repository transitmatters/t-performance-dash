import type dayjs from 'dayjs';
import React from 'react';
import { SimpleDeltaWidget } from '../../common/components/widgets/internal/SimpleDeltaWidget';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { DayDelayTotals } from '../../common/types/dataPoints';
import type { LineShort, Line } from '../../common/types/lines';
import { getSlowZoneDelayDelta, useFilteredDelayTotals } from '../../common/utils/slowZoneUtils';

import { TotalSlowTime } from './charts/TotalSlowTime';

interface TotalSlowTimeWrapperProps {
  data: DayDelayTotals[];
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  line: Line;
  lineShort: LineShort;
}

export const TotalSlowTimeWrapper: React.FC<TotalSlowTimeWrapperProps> = ({
  data,
  startDateUTC,
  endDateUTC,
  line,
  lineShort,
}) => {
  const filteredDelayTotals = useFilteredDelayTotals(data, startDateUTC, endDateUTC);
  const delayDelta = getSlowZoneDelayDelta(filteredDelayTotals, lineShort);

  return (
    <>
      <SimpleDeltaWidget widgetValue={new TimeWidgetValue(delayDelta, delayDelta)} />
      <div className="relative flex h-60">
        <TotalSlowTime
          // Pass all data and not filtered because we can filter using the X axis of the graph.
          data={data}
          startDateUTC={startDateUTC}
          endDateUTC={endDateUTC}
          line={line}
          lineShort={lineShort}
        />
      </div>
    </>
  );
};
