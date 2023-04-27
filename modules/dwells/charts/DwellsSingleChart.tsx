import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { locationDetails } from '../../../common/utils/stations';

interface DwellsSingleChartProps {
  dwells: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
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

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`dwells-chart-${linePath}`}
        title={'Time spent at station (dwells)'}
        data={dwells ?? []}
        date={startDate}
        metricField={MetricFieldKeys.dwellTimeSec}
        pointField={PointFieldKeys.arrDt}
        location={locationDetails(fromStation, toStation, lineShort)}
        fname={'dwells'}
        showLegend={false}
        isHomescreen={isHomescreen}
      />
    );
  }, [dwells, fromStation, linePath, lineShort, startDate, toStation, isHomescreen]);

  return chart;
};
