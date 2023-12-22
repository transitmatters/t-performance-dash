import { useMemo } from 'react';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { MetricFieldKeys, PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import { getLocationDetails } from '../../../common/utils/stations';

interface SpeedBetweenStationsSingleChartProps {
  traveltimes: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
}

export const SpeedBetweenStationsSingleChart: React.FC<SpeedBetweenStationsSingleChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
}) => {
  const {
    linePath,
    query: { date },
  } = useDelimitatedRoute();

  const location = getLocationDetails(fromStation, toStation);

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`speed-between-stations-chart-${linePath}`}
        data={traveltimes}
        date={date}
        metricField={MetricFieldKeys.speedMph}
        pointField={PointFieldKeys.depDt}
        bothStops={true}
        location={location}
        units={'MPH'}
        fname={'speeds'}
        showLegend={true}
      />
    );
  }, [linePath, traveltimes, date, fromStation, toStation, showLegend]);

  return chart;
};
