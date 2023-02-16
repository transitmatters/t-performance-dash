import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';
import type { SingleDayDataPoint } from '../../../src/charts/types';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../src/charts/types';

interface TravelTimesSingleChartProps {
  traveltimes: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  showLegend?: boolean;
  homescreen?: boolean;
}

export const TravelTimesSingleChart: React.FC<TravelTimesSingleChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
  homescreen = false,
}) => {
  const {
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const isLoading = useMemo(
    () => traveltimes.isLoading || toStation === undefined || fromStation === undefined,
    [traveltimes.isLoading, fromStation, toStation]
  );

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`traveltimes-chart-${linePath}`}
        title={'Travel Times'}
        data={traveltimes.data || []}
        date={startDate}
        metricField={MetricFieldKeys.travelTimeSec}
        pointField={PointFieldKeys.depDt}
        benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
        isLoading={isLoading}
        bothStops={true}
        location={locationDetails(fromStation, toStation, lineShort)}
        fname={'traveltimes'}
        showLegend={showLegend}
        homescreen={homescreen}
      />
    );
  }, [
    linePath,
    traveltimes.data,
    startDate,
    isLoading,
    fromStation,
    toStation,
    lineShort,
    showLegend,
    homescreen,
  ]);

  return chart;
};
