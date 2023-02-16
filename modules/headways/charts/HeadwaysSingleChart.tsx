import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';
import type { SingleDayDataPoint } from '../../../src/charts/types';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../src/charts/types';

interface HeadwaysSingleChartProps {
  headways: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  showLegend?: boolean;
}

export const HeadwaysSingleChart: React.FC<HeadwaysSingleChartProps> = ({
  headways,
  toStation,
  fromStation,
  showLegend = true,
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
  ]);

  return chart;
};
