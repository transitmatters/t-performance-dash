import React, { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

interface DwellsSingleChartProps {
  dwells: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
}

export const DwellsSingleChart: React.FC<DwellsSingleChartProps> = ({
  dwells,
  toStation,
  fromStation,
}) => {
  const {
    linePath,
    query: { date },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    return (
      <SingleDayLineChart
        chartId={`dwells-chart-${linePath}`}
        data={dwells}
        date={date}
        metricField={MetricFieldKeys.dwellTimeSec}
        pointField={PointFieldKeys.arrDt}
        location={getLocationDetails(fromStation, toStation)}
        fname={'dwells'}
        units={'Minutes'}
        showLegend={false}
      />
    );
  }, [dwells, fromStation, linePath, date, toStation]);

  return chart;
};
