import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { getTravelTimesSingleWidgetData } from '../../common/utils/traveltimes';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';

interface TravelTimesSingleWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station;
  fromStation: Station;
}

export const TravelTimesSingleWrapper: React.FC<TravelTimesSingleWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (query.data.length < 1) return <NoDataNotice />;

  const { average, fastest, slowest } = getTravelTimesSingleWidgetData(query.data);
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
          analysis={`Fastest Trip (${dayjs(fastest.dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(fastest.travel_time_sec)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Slowest Trip (${dayjs(slowest.dep_dt).format('h:mm A')})`}
          widgetValue={new TimeWidgetValue(slowest.travel_time_sec)}
        />
      </WidgetCarousel>
      <TravelTimesSingleChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
      />
    </CarouselGraphDiv>
  );
};
