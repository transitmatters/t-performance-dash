import { useMemo } from 'react';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { HoverCardRow } from '../../../common/components/charts/hoverCard/types';
import type {
  AggregateDataPoint,
  AggregateDataResponse,
  DayFilter,
} from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { SEVERITY_COLORS } from '../../../common/utils/chartTheme';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

const formatShare = (part: number, total: number) => `${Math.round((part / total) * 100)}%`;

/** The day's share of the Bunched and On time stats under the chart. */
const bunchingRows = ({ count, bunched, on_time }: AggregateDataPoint): HoverCardRow[] => {
  if (!count || bunched == null || on_time == null) return [];
  return [
    { label: 'Bunched', value: formatShare(bunched, count), color: SEVERITY_COLORS.off50 },
    { label: 'On time', value: formatShare(on_time, count), color: SEVERITY_COLORS.onTime },
  ];
};

interface HeadwaysAggregateChartProps {
  headways: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
  dayFilter?: DayFilter;
}

export const HeadwaysAggregateChart = ({
  headways,
  toStation,
  fromStation,
  dayFilter = 'all',
}: HeadwaysAggregateChartProps) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    // Filter data based on dayFilter
    let filteredData = headways.by_date.filter((datapoint) => datapoint.peak === 'all');

    if (dayFilter !== 'all') {
      filteredData = filteredData.filter((datapoint) => {
        if (!datapoint.service_date) return true; // Include data without service_date
        const isWeekendOrHolidayDate = datapoint.holiday || datapoint.weekend;
        return dayFilter === 'weekend' ? isWeekendOrHolidayDate : !isWeekendOrHolidayDate;
      });
    }

    return (
      <AggregateLineChart
        chartId={'headways_agg'}
        data={filteredData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={'Median headway'}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={false}
        fname="headways"
        yUnit="Minutes"
        hoverRows={bunchingRows}
      />
    );
  }, [headways.by_date, startDate, endDate, fromStation, toStation, dayFilter]);

  return chart;
};
