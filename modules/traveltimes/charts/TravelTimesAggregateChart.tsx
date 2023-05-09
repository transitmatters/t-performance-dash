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

  const traveltimesData =
    timeUnit === 'by_date'
      ? traveltimes.by_date.filter((datapoint) => datapoint.peak === 'all')
      : traveltimes.by_time.filter((datapoint) => datapoint.is_peak_day === peakTime);

  const title =
    timeUnit === 'by_date'
      ? 'Travel times'
      : `Travel times by hour (${peakTime ? 'Weekday' : 'Weekend/Holiday'})`;

  const chart = useMemo(() => {
    return (
      <AggregateLineChart
        chartId={'travel_times_agg'}
        title={title}
        data={traveltimesData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={
          timeUnit === 'by_date' ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch
        }
        timeUnit={timeUnit === 'by_date' ? 'day' : 'hour'}
        timeFormat={timeUnit === 'by_date' ? 'MMM d yyyy' : 'H:mm aaaa'}
        seriesName={'Median travel time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={locationDetails(fromStation, toStation, lineShort)}
        bothStops={true}
        fname="traveltimes"
      />
    );
  }, [title, traveltimesData, timeUnit, startDate, endDate, fromStation, toStation, lineShort]);

  return chart;
};
