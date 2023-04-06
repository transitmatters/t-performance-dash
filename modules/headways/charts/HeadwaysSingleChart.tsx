import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

export const HeadwaysSingleChart: React.FC<HeadwaysChartProps> = ({
  headways,
  toStation,
  fromStation,
  showLegend = true,
  isHomescreen = false,
}) => {
  const {
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const isLoading = useMemo(
    () => headways.isLoading || toStation === undefined || fromStation === undefined,
    [headways.isLoading, fromStation, toStation]
  );

  const anyHeadwayBenchmarks = headways.data?.some(
    (e) => e.benchmark_headway_time_sec && e.benchmark_headway_time_sec > 0
  );

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`headways-chart-${linePath}`}
        title={'Time between trains (headways)'}
        data={headways.data ?? []}
        date={startDate}
        metricField={MetricFieldKeys.headwayTimeSec}
        pointField={PointFieldKeys.currentDepDt}
        benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
        isLoading={isLoading}
        location={locationDetails(fromStation, toStation, lineShort)}
        fname={'headways'}
        showLegend={showLegend && anyHeadwayBenchmarks}
        isHomescreen={isHomescreen}
      />
    );
  }, [
    linePath,
    headways.data,
    startDate,
    isLoading,
    fromStation,
    toStation,
    lineShort,
    showLegend,
    anyHeadwayBenchmarks,
    isHomescreen,
  ]);

  return chart;
};
