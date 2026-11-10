import { useMemo } from 'react';
import type { ChunkedAggregateQueryResult, DayFilter } from '../../common/types/charts';
import type { TripComparison } from '../../common/types/comparison';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PartialDataNotice } from '../../common/components/notices/PartialDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import { ChartStack } from '../../common/components/charts/ChartStack';
import {
  filterByDayType,
  getAggDataWidgets,
  getWidgetComparisonData,
} from '../../common/utils/widgets';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

interface DwellsAggregateWrapperProps {
  query: ChunkedAggregateQueryResult;
  toStation: Station;
  fromStation: Station;
  /** Owned by the parent, whose card header renders the day-filter control. */
  dayFilter: DayFilter;
  /** A second period to draw and compare the stats against. */
  comparison?: TripComparison;
}

export const DwellsAggregateWrapper = ({
  query,
  toStation,
  fromStation,
  dayFilter,
  comparison,
}: DwellsAggregateWrapperProps) => {
  const allData = useMemo(
    () => query.data?.by_date.filter((datapoint) => datapoint.peak === 'all') ?? [],
    [query.data]
  );

  const dwellsData = useMemo(() => {
    if (dayFilter === 'all') return allData;
    return filterByDayType(allData, dayFilter);
  }, [allData, dayFilter]);

  const comparisonData = useMemo(
    () => getWidgetComparisonData(allData, dayFilter, comparison),
    [allData, dayFilter, comparison]
  );

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  if (dwellsData.length < 1)
    return <NoDataNotice shutdownScope="trip" metric="dwells" filtered={allData.length > 0} />;

  const widgetObjects = getAggDataWidgets(dwellsData, 'times', comparisonData);

  return (
    <>
      <ChartStack>
        <DwellsAggregateChart
          dwells={query.data}
          toStation={toStation}
          fromStation={fromStation}
          dayFilter={dayFilter}
          comparison={comparison}
        />
        {!query.chunks?.pending && <StatStrip widgetObjects={widgetObjects} />}
        <PartialDataNotice query={query} />
      </ChartStack>
    </>
  );
};
