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
import { getHeadwaysSingleWidgetData } from '../../common/utils/headways';
import { HeadwaysSingleChart } from './charts/HeadwaysSingleChart';

interface HeadwaysSingleWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station;
  fromStation: Station;
}

export const HeadwaysSingleWrapper: React.FC<HeadwaysSingleWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const { average, longest, shortest } = getHeadwaysSingleWidgetData(query.data);
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
          analysis={`Shortest Headway (${dayjs(shortest.current_dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(shortest.headway_time_sec)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Longest Headway (${dayjs(longest.current_dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(longest.headway_time_sec)}
        />
      </WidgetCarousel>
      <HeadwaysSingleChart headways={query.data} toStation={toStation} fromStation={fromStation} />
    </CarouselGraphDiv>
  );
};
