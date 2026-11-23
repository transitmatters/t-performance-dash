import { useMemo } from 'react';
import { SingleDayLineChart } from '../../../common/components/charts/SingleDayLineChart';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { PointFieldKeys, MetricFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useLinePage } from '../../../common/hooks/usePageParams';
import { getLocationDetails } from '../../../common/utils/stations';

interface DwellsSingleChartProps {
  dwells: SingleDayDataPoint[];
  toStation: Station;
  fromStation: Station;
  date: string;
  fill?: boolean;
}

export const DwellsSingleChart = ({
  dwells,
  toStation,
  fromStation,
  date,
  fill = false,
}: DwellsSingleChartProps) => {
  const linePage = useLinePage();
  const { linePath } = linePage;

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
        fill={fill}
        embedChart="dwells"
        alerts={linePage}
      />
    );
  }, [dwells, fromStation, linePath, linePage, date, toStation, fill]);

  return chart;
};
