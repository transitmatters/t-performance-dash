import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { AlertsScope } from '../../../common/types/alerts';
import type { HeadwaysChartProps } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import { getLocationDetails } from '../../../common/utils/stations';

export const HeadwaysSingleChart = ({
  headways,
  toStation,
  fromStation,
  showLegend = true,
  date,
  fill = false,
  callout,
  actions = true,
  intro = false,
  alerts,
}: HeadwaysChartProps & { alerts: AlertsScope }) => {
  const anyHeadwayBenchmarks = headways.some(
    (e) => e.benchmark_headway_time_sec && e.benchmark_headway_time_sec > 0
  );

  return (
    <SingleDayLineChart
      chartId="headways-chart"
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
      callout={callout}
      actions={actions}
      intro={intro}
      alerts={alerts}
    />
  );
};
