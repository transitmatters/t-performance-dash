import { useMemo } from 'react';
import type { ChunkedAggregateQueryResult, DayFilter } from '../../common/types/charts';
import type { TripComparison } from '../../common/types/comparison';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PartialDataNotice } from '../../common/components/notices/PartialDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import {
  filterByDayType,
  getAggDataWidgets,
  getWidgetComparisonData,
} from '../../common/utils/widgets';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

interface TravelTimesAggregateWrapperProps {
  query: ChunkedAggregateQueryResult;
  toStation: Station;
  fromStation: Station;
  /** Owned by the parent, whose card header renders the day-filter control. */
  dayFilter: DayFilter;
  /** A second period to draw and compare the stats against. */
  comparison?: TripComparison;
}

export const TravelTimesAggregateWrapper = ({
  query,
  toStation,
  fromStation,
  dayFilter,
  comparison,
}: TravelTimesAggregateWrapperProps) => {
  const allData = useMemo(
    () => query.data?.by_date.filter((datapoint) => datapoint.peak === 'all') ?? [],
    [query.data]
  );

  const traveltimesData = useMemo(() => {
    if (dayFilter === 'all') return allData;
    return filterByDayType(allData, dayFilter);
  }, [allData, dayFilter]);

  const comparisonData = useMemo(
    () => getWidgetComparisonData(allData, dayFilter, comparison),
    [allData, dayFilter, comparison]
  );

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  if (traveltimesData.length < 1)
    return <NoDataNotice shutdownScope="trip" metric="traveltimes" filtered={allData.length > 0} />;

  const widgetObjects = getAggDataWidgets(traveltimesData, 'times', comparisonData);

  return (
    <>
      <ChartStack>
        <TravelTimesAggregateChart
          traveltimes={query.data}
          toStation={toStation}
          fromStation={fromStation}
          timeUnit={'by_date'}
          dayFilter={dayFilter}
          comparison={comparison}
        />
        {!query.chunks?.pending && <StatStrip widgetObjects={widgetObjects} />}
        <PartialDataNotice query={query} />
      </ChartStack>
    </>
  );
};
