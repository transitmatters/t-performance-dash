import React, { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, DayFilter } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { filterByDayType, getAggDataWidgets, getComparisonData } from '../../common/utils/widgets';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

interface DwellsAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
  /** Owned by the parent, whose card header renders the day-filter control. */
  dayFilter: DayFilter;
}

export const DwellsAggregateWrapper: React.FC<DwellsAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
  dayFilter,
}) => {
  const allData = useMemo(
    () => query.data?.by_date.filter((datapoint) => datapoint.peak === 'all') ?? [],
    [query.data]
  );

  const dwellsData = useMemo(() => {
    if (dayFilter === 'all') return allData;
    return filterByDayType(allData, dayFilter);
  }, [allData, dayFilter]);

  const comparisonData = useMemo(() => getComparisonData(allData, dayFilter), [allData, dayFilter]);

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  if (dwellsData.length < 1) return <NoDataNotice />;

  const widgetObjects = getAggDataWidgets(dwellsData, 'times', comparisonData);

  return (
    <>
      <CarouselGraphDiv>
        <DwellsAggregateChart
          dwells={query.data}
          toStation={toStation}
          fromStation={fromStation}
          dayFilter={dayFilter}
        />
        <StatStrip widgetObjects={widgetObjects} />
      </CarouselGraphDiv>
    </>
  );
};
