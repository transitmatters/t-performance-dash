import { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

export const HeadwaysSingleChart = ({
  headways,
  toStation,
  fromStation,
  showLegend = true,
  date: dateProp,
  fill = false,
}: HeadwaysChartProps) => {
  const { linePath, query } = useDelimitatedRoute();
  const date = dateProp ?? query.date;

  const anyHeadwayBenchmarks = headways.some(
    (e) => e.benchmark_headway_time_sec && e.benchmark_headway_time_sec > 0
  );

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`headways-chart-${linePath}`}
        data={headways}
        date={date}
        metricField={MetricFieldKeys.headwayTimeSec}
        pointField={PointFieldKeys.currentDepDt}
        benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
        location={getLocationDetails(fromStation, toStation)}
        fname={'headways'}
        units={'Minutes'}
        showLegend={showLegend && anyHeadwayBenchmarks}
        showUnderRatio={true}
        fill={fill}
        embedChart="headways"
      />
    );
  }, [linePath, headways, date, fromStation, toStation, showLegend, anyHeadwayBenchmarks, fill]);

  return chart;
};
