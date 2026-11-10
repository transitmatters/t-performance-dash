import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { getSingleDayWidgets } from '../../common/utils/widgets';
import { DwellsSingleChart } from './charts/DwellsSingleChart';
import { DwellsTerminusNotice } from './DwellsTerminusNotice';

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
  if (fromStation?.terminus) return <DwellsTerminusNotice />;

  const dataReady =
    !query.isError && query.data && toStation && fromStation && query.data.length > 0;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (query.data.length < 1) return <NoDataNotice />;
  const widgetObjects = getSingleDayWidgets(query.data, 'dwells');

  return (
    <CarouselGraphDiv>
      <DwellsSingleChart dwells={query.data} toStation={toStation} fromStation={fromStation} />
      <MiniWidgetCreator widgetObjects={widgetObjects} />
    </CarouselGraphDiv>
  );
};
