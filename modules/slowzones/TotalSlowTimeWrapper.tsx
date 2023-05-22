import type dayjs from 'dayjs';
import React from 'react';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { DayDelayTotals } from '../../common/types/dataPoints';
import type { LineShort, Line } from '../../common/types/lines';
import { getSlowZoneDelayDelta, useFilteredDelayTotals } from '../../common/utils/slowZoneUtils';

import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { todayOrDate } from '../../common/constants/dates';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface TotalSlowTimeWrapperProps {
  data: DayDelayTotals[];
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  line: Line;
  lineShort: LineShort;
  showTitle?: boolean;
}

export const TotalSlowTimeWrapper: React.FC<TotalSlowTimeWrapperProps> = ({
  data,
  startDateUTC,
  endDateUTC,
  line,
  lineShort,
  showTitle = false,
}) => {
  const filteredDelayTotals = useFilteredDelayTotals(data, startDateUTC, endDateUTC);
  const delayDelta = getSlowZoneDelayDelta(filteredDelayTotals, lineShort);

  return (
    <>
      <BasicWidgetDataLayout
        widgetValue={
          new TimeWidgetValue(
            filteredDelayTotals[filteredDelayTotals.length - 1]?.[lineShort],
            delayDelta
          )
        }
        title={todayOrDate(endDateUTC)}
        analysis={'over period'}
      />
      <div className="relative flex h-60">
        <TotalSlowTime
          // Pass all data and not filtered because we can filter using the X axis of the graph.
          data={data}
          startDateUTC={startDateUTC}
          endDateUTC={endDateUTC}
          line={line}
          lineShort={lineShort}
          showTitle={showTitle}
        />
      </div>
    </>
  );
};
