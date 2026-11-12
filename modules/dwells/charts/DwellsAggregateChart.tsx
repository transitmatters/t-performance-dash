import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse, DayFilter } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

interface DwellsAggregateChartProps {
  dwells: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  dayFilter?: DayFilter;
  /** Defaults to the page's dates; an embed passes its own. */
  startDate?: string;
  endDate?: string;
  fill?: boolean;
  trendline?: boolean;
}

export const DwellsAggregateChart = ({
  dwells,
  toStation,
  fromStation,
  dayFilter = 'all',
  startDate: startDateProp,
  endDate: endDateProp,
  fill = false,
  trendline = false,
}: DwellsAggregateChartProps) => {
  const { query } = useDelimitatedRoute();
  const startDate = startDateProp ?? query.startDate;
  const endDate = endDateProp ?? query.endDate;

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
        embedChart={'dwells'}
      />
    );
  }, [dwells.by_date, startDate, endDate, fromStation, toStation, dayFilter, fill, trendline]);

  return chart;
};
