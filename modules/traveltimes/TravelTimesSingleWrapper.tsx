import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { getSingleDayWidgets } from '../../common/utils/widgets';
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
  const widgetObjects = getSingleDayWidgets(query.data, 'traveltimes');
  return (
    <CarouselGraphDiv>
      <TravelTimesSingleChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
      />
      <MiniWidgetCreator widgetObjects={widgetObjects} />
    </CarouselGraphDiv>
  );
};
