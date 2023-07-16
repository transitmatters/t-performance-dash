import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { getAggDataWidgets } from '../../common/utils/widgets';
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
  const widgetObjects = getAggDataWidgets(traveltimesData);
  return (
    <CarouselGraphDiv>
      <TravelTimesAggregateChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
        timeUnit={'by_date'}
      />
      <MiniWidgetCreator widgetObjects={widgetObjects} />
    </CarouselGraphDiv>
  );
};
