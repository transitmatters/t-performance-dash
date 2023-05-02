import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SingleDayDataPoint } from '../../types/charts';
import type { Station } from '../../types/stations';
import { ChartPlaceHolder } from '../graphics/ChartPlaceHolder';
import { TravelTimesSingleChart } from '../../../modules/traveltimes/charts/TravelTimesSingleChart';
import { HeadwaysSingleChart } from '../../../modules/headways/charts/HeadwaysSingleChart';
import { DwellsSingleChart } from '../../../modules/dwells/charts/DwellsSingleChart';

interface SingleChartWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  type: 'headways' | 'traveltimes' | 'dwells';
  isHomescreen?: boolean;
  showLegend?: boolean;
}

export const SingleChartWrapper: React.FC<SingleChartWrapperProps> = ({
  query,
  toStation,
  fromStation,
  type,
  isHomescreen,
  showLegend,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  switch (type) {
    case 'traveltimes':
      return (
        <TravelTimesSingleChart
          traveltimes={query.data}
          toStation={toStation}
          fromStation={fromStation}
          isHomescreen={isHomescreen}
          showLegend={showLegend}
        />
      );
    case 'headways':
      return (
        <HeadwaysSingleChart
          headways={query.data}
          fromStation={fromStation}
          toStation={toStation}
          isHomescreen={isHomescreen}
        />
      );
    case 'dwells':
      return (
        <DwellsSingleChart
          dwells={query.data}
          fromStation={fromStation}
          toStation={toStation}
          isHomescreen={isHomescreen}
        />
      );
  }
};
