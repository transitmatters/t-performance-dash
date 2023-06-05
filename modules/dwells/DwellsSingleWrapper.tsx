import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { getDwellsSingleWidgetData } from '../../common/utils/dwells';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { DwellsSingleChart } from './charts/DwellsSingleChart';

interface DwellsSingleWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station;
  fromStation: Station;
}

export const DwellsSingleWrapper: React.FC<DwellsSingleWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady =
    !query.isError && query.data && toStation && fromStation && query.data.length > 0;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (query.data.length < 1) return <NoDataNotice />;
  const { average, longest, shortest } = getDwellsSingleWidgetData(query.data);
  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={'Average'}
          widgetValue={new TimeWidgetValue(average)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Longest dwell (${dayjs(longest?.dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(longest?.dwell_time_sec)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Shortest dwell (${dayjs(shortest?.dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(shortest?.dwell_time_sec)}
        />
      </WidgetCarousel>
      <DwellsSingleChart dwells={query.data} toStation={toStation} fromStation={fromStation} />
    </CarouselGraphDiv>
  );
};
