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
}

export const TravelTimesSingleChart: React.FC<TravelTimesSingleChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
}) => {
  const {
    linePath,
    query: { date },
  } = useDelimitatedRoute();

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
        bothStops={true}
        units="Minutes"
        location={getLocationDetails(fromStation, toStation)}
        fname={'traveltimes'}
        showLegend={showLegend && anyTravelBenchmarks}
      />
    );
  }, [linePath, traveltimes, date, fromStation, toStation, showLegend, anyTravelBenchmarks]);

  return chart;
};
