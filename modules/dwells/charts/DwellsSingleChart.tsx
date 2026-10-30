import { useMemo } from 'react';
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
  /** The day shown; defaults to the URL's `date`. */
  date?: string;
  fill?: boolean;
}

export const DwellsSingleChart = ({
  dwells,
  toStation,
  fromStation,
  date: dateProp,
  fill = false,
}: DwellsSingleChartProps) => {
  const { linePath, query } = useDelimitatedRoute();
  const date = dateProp ?? query.date;

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
      />
    );
  }, [dwells, fromStation, linePath, date, toStation, fill]);

  return chart;
};
