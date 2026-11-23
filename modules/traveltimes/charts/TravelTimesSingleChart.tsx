import { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { BenchmarkFieldKeys, PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useLinePage } from '../../../common/hooks/usePageParams';
import { getLocationDetails } from '../../../common/utils/stations';

interface TravelTimesSingleChartProps {
  traveltimes: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
  date: string;
  fill?: boolean;
}

export const TravelTimesSingleChart = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
  date,
  fill = false,
}: TravelTimesSingleChartProps) => {
  const linePage = useLinePage();
  const { linePath } = linePage;

  const anyTravelBenchmarks =
    Array.isArray(traveltimes) &&
    traveltimes.some((e) => e.benchmark_travel_time_sec && e.benchmark_travel_time_sec > 0);

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`traveltimes-chart-${linePath}`}
        data={traveltimes}
        date={date}
        metricField={MetricFieldKeys.travelTimeSec}
        pointField={PointFieldKeys.depDt}
        benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
        tmBenchmarkField={BenchmarkFieldKeys.tmBenchmarkTravelTimeSec}
        includeBothStopsForLocation={true}
        units="Minutes"
        location={getLocationDetails(fromStation, toStation)}
        fname={'traveltimes'}
        showLegend={showLegend && anyTravelBenchmarks}
        fill={fill}
        embedChart="traveltimes"
        alerts={linePage}
      />
    );
  }, [
    linePath,
    linePage,
    traveltimes,
    date,
    fromStation,
    toStation,
    showLegend,
    anyTravelBenchmarks,
    fill,
  ]);

  return chart;
};
