import type { SingleDayDataPoint } from '../../../common/types/charts';
import { MetricFieldKeys, PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useLinePage } from '../../../common/hooks/usePageParams';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import { getLocationDetails } from '../../../common/utils/stations';

interface SpeedBetweenStationsSingleChartProps {
  traveltimes: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
  date: string;
}

export const SpeedBetweenStationsSingleChart = ({
  traveltimes,
  toStation,
  fromStation,
  showLegend = true,
  date,
}: SpeedBetweenStationsSingleChartProps) => {
  const linePage = useLinePage();

  const location = getLocationDetails(fromStation, toStation);

  return (
    <SingleDayLineChart
      chartId={`speed-between-stations-chart-${linePage.linePath}`}
      data={traveltimes}
      date={date}
      metricField={MetricFieldKeys.speedMph}
      pointField={PointFieldKeys.depDt}
      includeBothStopsForLocation={true}
      location={location}
      units={'MPH'}
      fname={'speeds'}
      chartTitle="Speeds"
      showLegend={showLegend}
      alerts={linePage}
    />
  );
};
