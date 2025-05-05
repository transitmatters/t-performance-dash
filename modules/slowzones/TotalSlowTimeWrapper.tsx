import type dayjs from 'dayjs';
import React from 'react';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { DayDelayTotals } from '../../common/types/dataPoints';
import type { LineShort, Line } from '../../common/types/lines';
import { getSlowZoneDelayDelta, useFilteredDelayTotals } from '../../common/utils/slowZoneUtils';

import { todayOrDate } from '../../common/constants/dates';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface TotalSlowTimeWrapperProps {
  data: DayDelayTotals[];
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  line: Line;
  lineShort: Exclude<LineShort, 'Bus' | 'Commuter Rail'>;
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
    <CarouselGraphDiv>
      <WidgetCarousel isSingleWidget>
        <WidgetForCarousel
          widgetValue={
            new TimeWidgetValue(
              filteredDelayTotals[filteredDelayTotals.length - 1]?.[lineShort],
              delayDelta
            )
          }
          layoutKind="no-delta"
          analysis={`Current (${todayOrDate(endDateUTC)})`}
        />
      </WidgetCarousel>
      <TotalSlowTime
        // Pass all data and not filtered because we can filter using the X axis of the graph.
        data={data}
        startDateUTC={startDateUTC}
        endDateUTC={endDateUTC}
        line={line}
        lineShort={lineShort}
        showTitle={showTitle}
      />
    </CarouselGraphDiv>
  );
};
