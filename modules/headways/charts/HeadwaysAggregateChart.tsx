import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface HeadwaysAggregateChartProps {
  headways: UseQueryResult<AggregateDataResponse>;
  fromStation: Station | undefined;
  showLegend?: boolean;
}

export const HeadwaysAggregateChart: React.FC<HeadwaysAggregateChartProps> = ({
  headways,
  fromStation,
}) => {
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    return (
      <AggregateLineChart
        chartId={'headways_agg'}
        title={'Time between trains (headways)'}
        data={headways?.data?.by_date?.filter((datapoint) => datapoint.peak === 'all') || []}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={'Median headway'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={locationDetails(fromStation, undefined, lineShort)}
        isLoading={false}
        bothStops={false}
        fname="headways"
      />
    );
  }, [headways?.data?.by_date, startDate, endDate, fromStation, lineShort]);

  return chart;
};
