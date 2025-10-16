import React, { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, DayFilter } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { MiniWidgetCreator } from '../../common/components/widgets/MiniWidgetCreator';
import { getAggHeadwayDataWidgets } from '../../common/utils/widgets';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HeadwaysAggregateChart } from './charts/HeadwaysAggregateChart';

interface HeadwaysAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const HeadwaysAggregateWrapper: React.FC<HeadwaysAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const { line } = useDelimitatedRoute();
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');

  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;

  // Filter the data for widgets based on the current dayFilter
  let headwaysData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  if (dayFilter !== 'all') {
    headwaysData = headwaysData.filter((datapoint) => {
      if (!datapoint.service_date) return true;
      const isWeekendOrHolidayDate = datapoint.holiday || datapoint.weekend;
      return dayFilter === 'weekend' ? isWeekendOrHolidayDate : !isWeekendOrHolidayDate;
    });
  }

  if (headwaysData.length < 1) return <NoDataNotice />;
  const widgetObjects = getAggHeadwayDataWidgets(headwaysData, 'times');

  return (
    <>
      <CarouselGraphDiv>
        <HeadwaysAggregateChart
          headways={query.data}
          toStation={toStation}
          fromStation={fromStation}
          dayFilter={dayFilter}
        />
        <MiniWidgetCreator widgetObjects={widgetObjects} />
      </CarouselGraphDiv>
      <div className={'flex w-full justify-center pt-2'}>
        <ButtonGroup
          line={line}
          pressFunction={setDayFilter}
          options={[
            ['all', 'All days'],
            ['weekday', 'Weekdays only'],
            ['weekend', 'Weekends & holidays'],
          ]}
          additionalDivClass="md:w-auto"
          additionalButtonClass="md:w-fit"
        />
      </div>
    </>
  );
};
