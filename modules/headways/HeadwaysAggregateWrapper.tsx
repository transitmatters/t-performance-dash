import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { getHeadwaysAggregateWidgetData } from '../../common/utils/headways';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { SMALL_DATE_FORMAT } from '../../common/constants/dates';
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
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const headwaysData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  const { average, max } = getHeadwaysAggregateWidgetData(headwaysData);
  return (
    <div className="flex flex-col gap-x-2 gap-y-1 pt-2">
      <WidgetCarousel>
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={'Average'}
          widgetValue={new TimeWidgetValue(average)}
        />
        <WidgetForCarousel
          layoutKind="no-delta"
          analysis={`Longest Headway (${dayjs(max.service_date).format(SMALL_DATE_FORMAT)})`}
          widgetValue={new TimeWidgetValue(max.max)}
        />
      </WidgetCarousel>
      <HeadwaysAggregateChart
        headways={query.data}
        toStation={toStation}
        fromStation={fromStation}
      />
    </div>
  );
};
