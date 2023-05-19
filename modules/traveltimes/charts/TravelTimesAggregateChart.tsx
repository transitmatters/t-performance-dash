import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse, TravelTimesUnit } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface TravelTimesAggregateChartProps {
  traveltimes: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  timeUnit?: TravelTimesUnit;
  peakTime?: boolean;
}

export const TravelTimesAggregateChart: React.FC<TravelTimesAggregateChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
  timeUnit,
  peakTime = true,
}) => {
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    const timeUnitByDate = timeUnit === 'by_date';

    const title = timeUnitByDate
      ? 'Travel times'
      : `Travel times by hour (${peakTime ? 'Weekday' : 'Weekend/Holiday'})`;

    const traveltimesData = timeUnitByDate
      ? traveltimes.by_date.filter((datapoint) => datapoint.peak === 'all')
      : traveltimes.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime);
    return (
      <AggregateLineChart
        chartId={`travel_times_agg_${timeUnitByDate ? 'by_date' : 'by_time'}`}
        title={title}
        data={traveltimesData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={timeUnitByDate ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch}
        timeUnit={timeUnitByDate ? 'day' : 'hour'}
        byTime={!timeUnitByDate}
        timeFormat={timeUnitByDate ? 'MMM d yyyy' : 'H:mm aaaa'}
        seriesName={'Median travel time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={timeUnitByDate ? CHART_COLORS.FILL : CHART_COLORS.FILL_HOURLY}
        location={locationDetails(fromStation, toStation, lineShort)}
        bothStops={true}
        fname="traveltimes"
      />
    );
  }, [timeUnit, peakTime, traveltimes, startDate, endDate, fromStation, toStation, lineShort]);

  return chart;
};
