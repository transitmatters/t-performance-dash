import React, { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface HeadwaysAggregateChartProps {
  headways: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
}

export const HeadwaysAggregateChart: React.FC<HeadwaysAggregateChartProps> = ({
  headways,
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
        chartId={'headways_agg'}
        title={`Time between ${lineShort !== 'Bus' ? 'trains' : 'bus'} (headways)`}
        data={headways.by_date.filter((datapoint) => datapoint.peak === 'all') || []}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={'Median headway'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={locationDetails(fromStation, toStation, lineShort)}
        bothStops={false}
        fname="headways"
      />
    );
  }, [headways.by_date, startDate, endDate, fromStation, toStation, lineShort]);

  return chart;
};
