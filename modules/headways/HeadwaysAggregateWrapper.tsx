import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { getAggHeadwayDataWidgets } from '../../common/utils/widgets';
import { HeadwaysAggregateChart } from './charts/HeadwaysAggregateChart';

interface HeadwaysAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const HeadwaysAggregateWrapper: React.FC<HeadwaysAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const headwaysData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  if (headwaysData.length < 1) return <NoDataNotice />;
  const widgetObjects = getAggHeadwayDataWidgets(headwaysData, 'times');

  return (
    <CarouselGraphDiv>
      <HeadwaysAggregateChart
        headways={query.data}
        toStation={toStation}
        fromStation={fromStation}
      />
      <MiniWidgetCreator widgetObjects={widgetObjects} />
    </CarouselGraphDiv>
  );
};
