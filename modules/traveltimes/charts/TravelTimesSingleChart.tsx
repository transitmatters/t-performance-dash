import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

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

  const anyTravelBenchmarks =
    Array.isArray(traveltimes.data) &&
    traveltimes.data?.some((e) => e.benchmark_travel_time_sec && e.benchmark_travel_time_sec > 0);

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
        showLegend={showLegend && anyTravelBenchmarks}
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
    anyTravelBenchmarks,
    homescreen,
  ]);

  return chart;
};
