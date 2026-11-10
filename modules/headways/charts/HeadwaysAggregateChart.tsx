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
import type { TripComparison } from '../../../common/types/comparison';
import type { Station } from '../../../common/types/stations';
import { SEVERITY_COLORS } from '../../../common/utils/chartTheme';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';
import { getComparisonSeries } from '../../../common/utils/comparison';
import { filterByDayType } from '../../../common/utils/widgets';

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
  /** Defaults to the page's dates; an embed passes its own. */
  startDate?: string;
  endDate?: string;
  fill?: boolean;
  trendline?: boolean;
  /** A second period, drawn as a dashed median over this one. */
  comparison?: TripComparison;
}

export const HeadwaysAggregateChart = ({
  headways,
  toStation,
  fromStation,
  dayFilter = 'all',
  startDate: startDateProp,
  endDate: endDateProp,
  fill = false,
  trendline = false,
  comparison,
}: HeadwaysAggregateChartProps) => {
  const { query } = useDelimitatedRoute();
  const startDate = startDateProp ?? query.startDate;
  const endDate = endDateProp ?? query.endDate;

  const chart = useMemo(() => {
    // The same filter runs over the comparison period, so both lines show the same kind of day.
    const selectData = (response: AggregateDataResponse) => {
      const byDate = response.by_date.filter((datapoint) => datapoint.peak === 'all');
      return dayFilter === 'all' ? byDate : filterByDayType(byDate, dayFilter);
    };
    const filteredData = selectData(headways);

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
        fill={fill}
        trendline={trendline}
        embedChart={'headways'}
        comparison={getComparisonSeries(comparison, selectData)}
      />
    );
  }, [
    headways,
    startDate,
    endDate,
    fromStation,
    toStation,
    dayFilter,
    fill,
    trendline,
    comparison,
  ]);

  return chart;
};
