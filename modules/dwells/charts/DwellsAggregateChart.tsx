import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface DwellsAggregateChartProps {
  dwells: UseQueryResult<AggregateDataResponse>;
  fromStation: Station | undefined;
  showLegend?: boolean;
}

export const DwellsAggregateChart: React.FC<DwellsAggregateChartProps> = ({
  dwells,
  fromStation,
}) => {
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    return (
      <AggregateLineChart
        chartId={'dwells_agg'}
        title={'Time spent at station (dwells)'}
        data={dwells?.data?.by_date?.filter((datapoint) => datapoint.peak === 'all') || []}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={'Median dwell time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={locationDetails(fromStation, undefined, lineShort)}
        isLoading={false}
        bothStops={false}
        fname="dwells"
      />
    );
  }, [dwells?.data?.by_date, startDate, endDate, fromStation, lineShort]);

  return chart;
};
