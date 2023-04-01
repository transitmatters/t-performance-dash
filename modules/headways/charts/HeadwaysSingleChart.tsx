import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

export const HeadwaysSingleChart: React.FC<HeadwaysChartProps> = ({
  headways,
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
    () => headways.isLoading || fromStation === undefined,
    [headways.isLoading, fromStation]
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
        location={locationDetails(fromStation, undefined, lineShort)}
        fname={'headways'}
        showLegend={showLegend && anyHeadwayBenchmarks}
        homescreen={homescreen}
      />
    );
  }, [
    linePath,
    headways.data,
    startDate,
    isLoading,
    fromStation,
    lineShort,
    showLegend,
    anyHeadwayBenchmarks,
    homescreen,
  ]);

  return chart;
};
