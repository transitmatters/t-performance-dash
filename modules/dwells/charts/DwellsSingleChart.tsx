import type { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface DwellsSingleChartProps {
  dwells: UseQueryResult<SingleDayDataPoint[]>;
  fromStation: Station | undefined;
  homescreen?: boolean;
}

export const DwellsSingleChart: React.FC<DwellsSingleChartProps> = ({
  dwells,
  fromStation,
  homescreen = false,
}) => {
  const {
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const isLoading = useMemo(
    () => dwells.isLoading || fromStation === undefined,
    [dwells.isLoading, fromStation]
  );

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`dwells-chart-${linePath}`}
        title={'Time spent at station (dwells)'}
        data={dwells.data ?? []}
        date={startDate}
        metricField={MetricFieldKeys.dwellTimeSec}
        pointField={PointFieldKeys.arrDt}
        isLoading={isLoading}
        location={locationDetails(fromStation, undefined, lineShort)}
        fname={'dwells'}
        showLegend={false}
        homescreen={homescreen}
      />
    );
  }, [dwells.data, fromStation, isLoading, linePath, lineShort, startDate, homescreen]);

  return chart;
};
