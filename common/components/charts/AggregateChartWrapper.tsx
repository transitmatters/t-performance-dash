import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse } from '../../types/charts';
import type { Station } from '../../types/stations';
import { ChartPlaceHolder } from '../graphics/ChartPlaceHolder';
import { TravelTimesAggregateChart } from '../../../modules/traveltimes/charts/TravelTimesAggregateChart';
import { DwellsAggregateChart } from '../../../modules/dwells/charts/DwellsAggregateChart';
import { HeadwaysAggregateChart } from '../../../modules/headways/charts/HeadwaysAggregateChart';

interface AggregateChartWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  type: 'headways' | 'traveltimes' | 'dwells';
  showLegend?: boolean;
}

export const AggregateChartWrapper: React.FC<AggregateChartWrapperProps> = ({
  query,
  toStation,
  fromStation,
  type,
  showLegend,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  switch (type) {
    case 'traveltimes':
      return (
        <TravelTimesAggregateChart
          traveltimes={query.data}
          toStation={toStation}
          fromStation={fromStation}
          showLegend={showLegend}
        />
      );
    case 'headways':
      return (
        <HeadwaysAggregateChart
          headways={query.data}
          fromStation={fromStation}
          toStation={toStation}
        />
      );
    case 'dwells':
      return (
        <DwellsAggregateChart dwells={query.data} fromStation={fromStation} toStation={toStation} />
      );
  }
};
