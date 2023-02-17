import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../src/charts/types';

export const HeadwaysSingleChart: React.FC<HeadwaysChartProps> = ({
  headways,
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
    () => headways.isLoading || toStation === undefined || fromStation === undefined,
    [headways.isLoading, fromStation, toStation]
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
        showLegend={showLegend}
        homescreen={homescreen}
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
    homescreen,
  ]);

  return chart;
};
