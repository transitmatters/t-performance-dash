import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import { getTravelTimesAggregateWidgetData } from '../../common/utils/traveltimes';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

interface TravelTimesAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const TravelTimesAggregateWrapper: React.FC<TravelTimesAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation && query.data;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const traveltimesData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  if (traveltimesData.length < 1) return <NoDataNotice />;
  const { average, fastest, deltaWidgetValue } = getTravelTimesAggregateWidgetData(traveltimesData);
  return (
    <CarouselGraphDiv>
      <WidgetCarousel>
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={'Average'}
          widgetValue={new TimeWidgetValue(average)}
        />
        <WidgetForCarousel
          analysis={'Change over period'}
          layoutKind="delta-and-percent-change"
          widgetValue={deltaWidgetValue}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Fastest Trip (${dayjs(fastest?.service_date).format('MM/DD/YY')})`}
          widgetValue={new TimeWidgetValue(fastest?.min)}
        />
      </WidgetCarousel>
      <TravelTimesAggregateChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
        timeUnit={'by_date'}
      />
    </CarouselGraphDiv>
  );
};
