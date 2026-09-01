import React, { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, DayFilter } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { StatStrip } from '../../common/components/widgets/StatStrip';
import { filterByDayType, getAggDataWidgets, getComparisonData } from '../../common/utils/widgets';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

interface TravelTimesAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
  /** Owned by the parent, whose card header renders the day-filter control. */
  dayFilter: DayFilter;
}

export const TravelTimesAggregateWrapper: React.FC<TravelTimesAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
  dayFilter,
}) => {
  const allData = useMemo(
    () => query.data?.by_date.filter((datapoint) => datapoint.peak === 'all') ?? [],
    [query.data]
  );

  const traveltimesData = useMemo(() => {
    if (dayFilter === 'all') return allData;
    return filterByDayType(allData, dayFilter);
  }, [allData, dayFilter]);

  const comparisonData = useMemo(() => getComparisonData(allData, dayFilter), [allData, dayFilter]);

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  if (traveltimesData.length < 1) return <NoDataNotice />;

  const widgetObjects = getAggDataWidgets(traveltimesData, 'times', comparisonData);

  return (
    <>
      <CarouselGraphDiv>
        <TravelTimesAggregateChart
          traveltimes={query.data}
          toStation={toStation}
          fromStation={fromStation}
          timeUnit={'by_date'}
          dayFilter={dayFilter}
        />
        <StatStrip widgetObjects={widgetObjects} />
      </CarouselGraphDiv>
    </>
  );
};
