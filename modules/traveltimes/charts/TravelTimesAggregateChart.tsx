import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type {
  AggregateDataResponse,
  TravelTimesUnit,
  DayFilter,
} from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { TripComparison } from '../../../common/types/comparison';
import type { Station } from '../../../common/types/stations';
import { getComparisonSeries } from '../../../common/utils/comparison';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';
import { filterByDayType } from '../../../common/utils/widgets';

interface TravelTimesAggregateChartProps {
  traveltimes: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
  dayFilter?: DayFilter;
  /** Defaults to the page's dates; an embed passes its own. */
  startDate?: string;
  endDate?: string;
  fill?: boolean;
  trendline?: boolean;
  /** A second period, drawn as a dashed median over this one. */
  comparison?: TripComparison;
}

export const TravelTimesAggregateChart = ({
  traveltimes,
  toStation,
  fromStation,
  timeUnit = 'by_date',
  peakTime = true,
  dayFilter = 'all',
  startDate: startDateProp,
  endDate: endDateProp,
  fill = false,
  trendline = false,
  comparison,
}: TravelTimesAggregateChartProps) => {
  const { query } = useDelimitatedRoute();
  const startDate = startDateProp ?? query.startDate;
  const endDate = endDateProp ?? query.endDate;

  const chart = useMemo(() => {
    const timeUnitByDate = timeUnit === 'by_date';

    // The same filter runs over the comparison period, so both lines show the same kind of day.
    const selectData = (response: AggregateDataResponse) => {
      if (!timeUnitByDate) {
        return response.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime);
      }
      const byDate = response.by_date.filter((datapoint) => datapoint.peak === 'all');
      // Apply day filter only for by_date data
      return dayFilter === 'all' ? byDate : filterByDayType(byDate, dayFilter);
    };
    const traveltimesData = selectData(traveltimes);

    return (
      <AggregateLineChart
        chartId={`travel_times_agg_${timeUnitByDate ? 'by_date' : 'by_time'}`}
        data={traveltimesData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={timeUnitByDate ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch}
        timeUnit={timeUnitByDate ? 'day' : 'hour'}
        byTime={!timeUnitByDate}
        timeFormat={timeUnitByDate ? 'MMM d yyyy' : 'h:mm aaaa'}
        seriesName={'Median travel time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={timeUnitByDate ? CHART_COLORS.FILL : CHART_COLORS.FILL_HOURLY}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={true}
        fname={'traveltimes'}
        chartTitle={timeUnitByDate ? 'Travel times' : 'Travel times by hour'}
        yUnit="Minutes"
        fill={fill}
        trendline={trendline}
        embedChart={timeUnitByDate ? 'traveltimes' : 'traveltimes-by-hour'}
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
    dayFilter,
    fill,
    trendline,
  ]);

  return chart;
};
