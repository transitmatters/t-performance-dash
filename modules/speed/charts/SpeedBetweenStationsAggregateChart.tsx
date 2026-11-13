import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse, TravelTimesUnit } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { TripComparison } from '../../../common/types/comparison';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';
import { getComparisonSeries } from '../../../common/utils/comparison';
import { convertToAggregateStationSpeedDataset } from '../utils/stationSpeed';

interface SpeedBetweenStationsAggregateChartProps {
  traveltimes: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
  /** Defaults to the page's dates; an embed passes its own. */
  startDate?: string;
  endDate?: string;
  fill?: boolean;
  trendline?: boolean;
  /** A second period, drawn as a dashed median over this one. */
  comparison?: TripComparison;
}

export const SpeedBetweenStationsAggregateChart = ({
  traveltimes,
  toStation,
  fromStation,
  timeUnit,
  peakTime = true,
  startDate: startDateProp,
  endDate: endDateProp,
  fill = false,
  trendline = false,
  comparison,
}: SpeedBetweenStationsAggregateChartProps) => {
  const { query } = useDelimitatedRoute();
  const startDate = startDateProp ?? query.startDate;
  const endDate = endDateProp ?? query.endDate;

  const chart = useMemo(() => {
    const timeUnitByDate = timeUnit === 'by_date';

    const selectData = (response: AggregateDataResponse) =>
      convertToAggregateStationSpeedDataset(
        fromStation.station,
        toStation.station,
        timeUnitByDate
          ? response.by_date.filter((datapoint) => datapoint.peak === 'all')
          : response.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime)
      );

    return (
      <AggregateLineChart
        chartId={`speed_between_stations_agg_${timeUnitByDate ? 'by_date' : 'by_time'}`}
        data={selectData(traveltimes)}
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
        embedChart={timeUnitByDate ? 'speeds' : undefined}
        comparison={getComparisonSeries(comparison, selectData, timeUnitByDate)}
      />
    );
  }, [
    comparison,
    timeUnit,
    traveltimes,
    startDate,
    endDate,
    fromStation,
    toStation,
    peakTime,
    fill,
    trendline,
  ]);

  return chart;
};
