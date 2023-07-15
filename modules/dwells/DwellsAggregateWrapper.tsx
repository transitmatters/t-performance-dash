import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { getAggDataWidgets } from '../../common/utils/widgets';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

interface DwellsAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const DwellsAggregateWrapper: React.FC<DwellsAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const dwellsData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  if (dwellsData.length < 1) return <NoDataNotice />;
  const widgetObjects = getAggDataWidgets(dwellsData);
  return (
    <CarouselGraphDiv>
      <DwellsAggregateChart dwells={query.data} toStation={toStation} fromStation={fromStation} />
      <MiniWidgetCreator widgetObjects={widgetObjects} />
    </CarouselGraphDiv>
  );
};
