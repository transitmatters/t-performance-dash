import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataPoint, TravelTimesUnit } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

interface TravelTimesAggregateChartProps {
  traveltimes: AggregateDataPoint[];
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
}) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const timeUnitByDate = timeUnit === 'by_date';

  const chart = useMemo(() => {
    return (
      <AggregateLineChart
        chartId={'travel_times_agg'}
        data={traveltimes}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour
        pointField={timeUnitByDate ? PointFieldKeys.serviceDate : PointFieldKeys.depTimeFromEpoch}
        timeUnit={timeUnitByDate ? 'day' : 'hour'}
        byTime={!timeUnitByDate}
        timeFormat={timeUnitByDate ? 'MMM d yyyy' : 'H:mm aaaa'}
        seriesName={'Median travel time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={timeUnitByDate ? CHART_COLORS.FILL : CHART_COLORS.FILL_HOURLY}
        location={getLocationDetails(fromStation, toStation)}
        bothStops={true}
        fname="traveltimes"
      />
    );
  }, [traveltimes, timeUnitByDate, startDate, endDate, fromStation, toStation]);

  return chart;
};
