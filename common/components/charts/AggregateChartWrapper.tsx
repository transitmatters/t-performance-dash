import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, TravelTimesUnit } from '../../types/charts';
import type { Station } from '../../types/stations';
import { ChartPlaceHolder } from '../graphics/ChartPlaceHolder';
import { NoDataNotice } from '../notices/NoDataNotice';
import { TravelTimesAggregateChart } from '../../../modules/traveltimes/charts/TravelTimesAggregateChart';
import { DwellsAggregateChart } from '../../../modules/dwells/charts/DwellsAggregateChart';
import { HeadwaysAggregateChart } from '../../../modules/headways/charts/HeadwaysAggregateChart';

interface AggregateChartWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
  type: 'headways' | 'traveltimes' | 'dwells';
}

export const AggregateChartWrapper: React.FC<AggregateChartWrapperProps> = ({
  query,
  toStation,
  fromStation,
  timeUnit,
  peakTime,
  type,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  // Mirrors the filter the chart itself applies, so an empty peak/off-peak slice says so instead
  // of drawing an empty grid.
  const plotted =
    timeUnit === 'by_time'
      ? (query.data.by_time ?? []).filter(
          (datapoint) => datapoint.is_peak_day === (peakTime ?? true)
        )
      : (query.data.by_date ?? []).filter((datapoint) => datapoint.peak === 'all');
  if (plotted.length < 1) return <NoDataNotice />;

  switch (type) {
    case 'traveltimes':
      return (
        <TravelTimesAggregateChart
          traveltimes={query.data}
          toStation={toStation}
          fromStation={fromStation}
          timeUnit={timeUnit}
          peakTime={peakTime}
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
