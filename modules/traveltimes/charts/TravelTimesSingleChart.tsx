import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

interface TravelTimesSingleChartProps {
  traveltimes: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
  isHomescreen?: boolean;
}

export const TravelTimesSingleChart: React.FC<TravelTimesSingleChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
  isHomescreen = false,
}) => {
  const {
    linePath,
    query: { startDate },
  } = useDelimitatedRoute();

  const anyTravelBenchmarks =
    Array.isArray(traveltimes) &&
    traveltimes.some((e) => e.benchmark_travel_time_sec && e.benchmark_travel_time_sec > 0);

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`traveltimes-chart-${linePath}`}
        data={traveltimes}
        date={startDate}
        metricField={MetricFieldKeys.travelTimeSec}
        pointField={PointFieldKeys.depDt}
        benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
        bothStops={true}
        location={getLocationDetails(fromStation, toStation)}
        fname={'traveltimes'}
        showLegend={showLegend && anyTravelBenchmarks}
        isHomescreen={isHomescreen}
      />
    );
  }, [
    linePath,
    traveltimes,
    startDate,
    fromStation,
    toStation,
    showLegend,
    anyTravelBenchmarks,
    isHomescreen,
  ]);

  return chart;
};
