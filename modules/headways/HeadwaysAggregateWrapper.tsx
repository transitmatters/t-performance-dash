import { useMemo } from 'react';
import type { ChunkedAggregateQueryResult, DayFilter } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PartialDataNotice } from '../../common/components/notices/PartialDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import {
  filterByDayType,
  getAggHeadwayDataWidgets,
  getComparisonData,
} from '../../common/utils/widgets';
import { HeadwaysAggregateChart } from './charts/HeadwaysAggregateChart';

interface HeadwaysAggregateWrapperProps {
  query: ChunkedAggregateQueryResult;
  toStation: Station;
  fromStation: Station;
  /** Owned by the parent, whose card header renders the day-filter control. */
  dayFilter: DayFilter;
}

export const HeadwaysAggregateWrapper = ({
  query,
  toStation,
  fromStation,
  dayFilter,
}: HeadwaysAggregateWrapperProps) => {
  const allData = useMemo(
    () => query.data?.by_date.filter((datapoint) => datapoint.peak === 'all') ?? [],
    [query.data]
  );

  const headwaysData = useMemo(() => {
    if (dayFilter === 'all') return allData;
    return filterByDayType(allData, dayFilter);
  }, [allData, dayFilter]);

  const comparisonData = useMemo(() => getComparisonData(allData, dayFilter), [allData, dayFilter]);

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  if (headwaysData.length < 1) return <NoDataNotice shutdownScope="trip" />;

  const widgetObjects = getAggHeadwayDataWidgets(headwaysData, 'times', comparisonData);

  return (
    <>
      <ChartStack>
        <HeadwaysAggregateChart
          headways={query.data}
          toStation={toStation}
          fromStation={fromStation}
          dayFilter={dayFilter}
        />
        {!query.chunks?.pending && <StatStrip widgetObjects={widgetObjects} />}
        <PartialDataNotice query={query} />
      </ChartStack>
    </>
  );
};
