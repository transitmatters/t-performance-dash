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
  toStation: Station | undefined;
  fromStation: Station | undefined;
  isHomescreen?: boolean;
}

export const DwellsSingleChart: React.FC<DwellsSingleChartProps> = ({
  dwells,
  toStation,
  fromStation,
  isHomescreen = false,
}) => {
  const {
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const isLoading = useMemo(
    () => dwells.isLoading || toStation === undefined || fromStation === undefined,
    [dwells.isLoading, fromStation, toStation]
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
        location={locationDetails(fromStation, toStation, lineShort)}
        fname={'dwells'}
        showLegend={false}
        isHomescreen={isHomescreen}
      />
    );
  }, [
    dwells.data,
    fromStation,
    isLoading,
    linePath,
    lineShort,
    startDate,
    toStation,
    isHomescreen,
  ]);

  return chart;
};
