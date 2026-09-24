import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { SingleDayDataPoint } from '../../common/types/charts';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import { getSingleDayWidgets } from '../../common/utils/widgets';
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
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (query.data.length < 1) return <NoDataNotice />;
  const widgetObjects = getSingleDayWidgets(query.data, 'dwells');

  return (
    <ChartStack>
      <DwellsSingleChart dwells={query.data} toStation={toStation} fromStation={fromStation} />
      <StatStrip widgetObjects={widgetObjects} />
    </ChartStack>
  );
};
