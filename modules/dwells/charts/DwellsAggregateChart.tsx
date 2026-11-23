import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type {
  AggregateDataResponse,
  AggregateLineProps,
  DayFilter,
} from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { getLocationDetails } from '../../../common/utils/stations';

interface DwellsAggregateChartProps {
  dwells: Pick<AggregateDataResponse, 'by_date'>;
  toStation: Station;
  fromStation: Station;
  dayFilter?: DayFilter;
  startDate: string;
  endDate: string;
  fill?: boolean;
  trendline?: boolean;
  loadingRanges?: AggregateLineProps['loadingRanges'];
}

export const DwellsAggregateChart = ({
  dwells,
  toStation,
  fromStation,
  dayFilter = 'all',
  startDate,
  endDate,
  fill = false,
  trendline = false,
  loadingRanges,
}: DwellsAggregateChartProps) => {
  const chart = useMemo(() => {
    // Filter data based on dayFilter
    let filteredData = dwells.by_date?.filter((datapoint) => datapoint.peak === 'all') || [];

    if (dayFilter !== 'all') {
      filteredData = filteredData.filter((datapoint) => {
        if (!datapoint.service_date) return true;
        const isWeekendOrHolidayDate = datapoint.holiday || datapoint.weekend;
        return dayFilter === 'weekend' ? isWeekendOrHolidayDate : !isWeekendOrHolidayDate;
      });
    }

    return (
      <AggregateLineChart
        chartId={'dwells_agg'}
        data={filteredData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={'Median dwell time'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={false}
        fname="dwells"
        yUnit="Minutes"
        fill={fill}
        trendline={trendline}
        loadingRanges={loadingRanges}
        embedChart={'dwells'}
      />
    );
  }, [
    dwells.by_date,
    startDate,
    endDate,
    fromStation,
    toStation,
    dayFilter,
    fill,
    trendline,
    loadingRanges,
  ]);

  return chart;
};
