import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';
import type { AggregateDataResponse } from '../../../src/charts/types';

interface TravelTimesAggregateChartProps {
  traveltimes: UseQueryResult<AggregateDataResponse>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
  showLegend?: boolean;
}

export const TravelTimesAggregateChart: React.FC<TravelTimesAggregateChartProps> = ({
  traveltimes,
  toStation,
  fromStation,
}) => {
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    return (
      <AggregateLineChart
        chartId={'travel_times_agg'}
        title={'Travel times'}
        data={traveltimes?.data?.by_date?.filter((datapoint) => datapoint.peak === 'all') || []}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName="Median travel time"
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={locationDetails(fromStation, toStation, lineShort)}
        isLoading={false}
        bothStops={true}
        fname="traveltimes"
      />
    );
  }, [traveltimes?.data?.by_date, startDate, endDate, fromStation, toStation, lineShort]);

  return chart;
};
