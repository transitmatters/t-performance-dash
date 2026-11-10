import { useTripExplorerQueries } from '../../common/api/datadashboard';
import { useTripComparisonQueries } from '../../common/api/hooks/comparison';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { PartialDataNotice } from '../../common/components/notices/PartialDataNotice';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { AggregateAPIParams, QueryNameKeys } from '../../common/types/api';
import type { RouteType } from '../../common/types/api';
import type { DayFilter } from '../../common/types/charts';
import type { ComparisonPeriod } from '../../common/types/comparison';
import type { Station } from '../../common/types/stations';
import { stopIdsForStations } from '../../common/utils/stations';

const CHART_QUERIES: Record<TripEmbedChart<'multi'>, QueryNameKeys> = {
  traveltimes: QueryNameKeys.traveltimes,
  speeds: QueryNameKeys.traveltimes,
  headways: QueryNameKeys.headways,
  dwells: QueryNameKeys.dwells,
  'traveltimes-by-hour': QueryNameKeys.traveltimes,
};

interface MultiTripEmbedChartProps {
  chart: TripEmbedChart<'multi'>;
  routeType: RouteType;
  fromStation: Station;
  toStation: Station;
  startDate: string;
  endDate: string;
  /** The day filter, or for travel times by hour, weekdays vs weekends. */
  days: DayFilter;
  trendline: boolean;
  /** From the embed's `vs` param: a second period to draw over this one. */
  comparisonPeriod?: ComparisonPeriod;
}

export const MultiTripEmbedChart = ({
  chart,
  routeType,
  fromStation,
  toStation,
  startDate,
  endDate,
  days,
  trendline,
  comparisonPeriod,
}: MultiTripEmbedChartProps) => {
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const queryName = CHART_QUERIES[chart];
  const parameters = {
    [AggregateAPIParams.stop]: fromStopIds,
    [AggregateAPIParams.fromStop]: fromStopIds,
    [AggregateAPIParams.toStop]: toStopIds,
    [AggregateAPIParams.startDate]: startDate,
    [AggregateAPIParams.endDate]: endDate,
  };
  const enabled = Boolean(fromStopIds && toStopIds && startDate && endDate);
  const result = useTripExplorerQueries(routeType, parameters, true, enabled, [queryName])[
    queryName
  ];
  const comparison = useTripComparisonQueries(routeType, parameters, comparisonPeriod, enabled, [
    queryName,
  ])[queryName];

  const byHour = chart === 'traveltimes-by-hour';
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="min-h-0 flex-1">
        <AggregateChartWrapper
          query={result}
          fromStation={fromStation}
          toStation={toStation}
          type={byHour ? 'traveltimes' : chart}
          timeUnit={byHour ? 'by_time' : 'by_date'}
          peakTime={byHour ? days !== 'weekend' : undefined}
          dayFilter={byHour ? undefined : days}
          startDate={startDate}
          endDate={endDate}
          trendline={trendline}
          comparison={comparison}
          fill
        />
      </div>
      <PartialDataNotice query={result} />
    </div>
  );
};
