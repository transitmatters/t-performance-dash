import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type {
  AggregateDataResponse,
  AggregateLineProps,
  TravelTimesUnit,
} from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useLinePage } from '../../../common/hooks/usePageParams';
import { getLocationDetails } from '../../../common/utils/stations';
import { convertToAggregateStationSpeedDataset } from '../utils/stationSpeed';

interface SpeedBetweenStationsAggregateChartProps {
  traveltimes: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
  startDate: string;
  endDate: string;
  fill?: boolean;
  trendline?: boolean;
  loadingRanges?: AggregateLineProps['loadingRanges'];
}

export const SpeedBetweenStationsAggregateChart = ({
  traveltimes,
  toStation,
  fromStation,
  timeUnit,
  peakTime = true,
  startDate,
  endDate,
  fill = false,
  trendline = false,
  loadingRanges,
}: SpeedBetweenStationsAggregateChartProps) => {
  const { lineShort, color } = useLinePage();

  const slowZonesTrip = useMemo(
    () => ({ fromStation, toStation, lineShort, color }),
    [fromStation, toStation, lineShort, color]
  );

  const chart = useMemo(() => {
    const timeUnitByDate = timeUnit === 'by_date';

    const traveltimesData = timeUnitByDate
      ? traveltimes.by_date.filter((datapoint) => datapoint.peak === 'all')
      : traveltimes.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime);

    return (
      <AggregateLineChart
        chartId={`speed_between_stations_agg_${timeUnitByDate ? 'by_date' : 'by_time'}`}
        data={convertToAggregateStationSpeedDataset(
          fromStation.station,
          toStation.station,
          traveltimesData
        )}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={timeUnitByDate ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch}
        timeUnit={timeUnitByDate ? 'day' : 'hour'}
        byTime={!timeUnitByDate}
        timeFormat={timeUnitByDate ? 'MMM d yyyy' : 'h:mm aaaa'}
        seriesName={'Median Speed'}
        startDate={startDate}
        endDate={endDate}
        fillColor={timeUnitByDate ? CHART_COLORS.FILL : CHART_COLORS.FILL_HOURLY}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={true}
        fname="speeds"
        chartTitle="Speeds"
        yUnit="MPH"
        fill={fill}
        trendline={trendline}
        slowZonesTrip={slowZonesTrip}
        loadingRanges={loadingRanges}
        embedChart={timeUnitByDate ? 'speeds' : undefined}
      />
    );
  }, [
    timeUnit,
    traveltimes,
    startDate,
    endDate,
    fromStation,
    toStation,
    peakTime,
    fill,
    trendline,
    slowZonesTrip,
    loadingRanges,
  ]);

  return chart;
};
