import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DataWidget } from '../../common/components/widgets/internal/DataWidget';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { averageHeadway } from '../../common/utils/headways';
import { WidgetCarousel } from '../../common/components/widgets/WidgetCarousel';
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
  const lg = !useBreakpoint('lg');
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const headwaysData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  const longestHeadway = headwaysData.reduce(
    (current, datapoint) => (datapoint.min < current.min ? datapoint : current),
    headwaysData[0]
  );
  return (
    <div className="flex flex-col gap-x-2 gap-y-1 pt-2 lg:flex-row-reverse">
      <HeadwaysAggregateChart
        headways={query.data}
        toStation={toStation}
        fromStation={fromStation}
      />
      <WidgetCarousel>
        <DataWidget
          title="Average"
          layoutKind="no-delta"
          analysis={'over period'}
          isLarge={!lg}
          widgetValue={new TimeWidgetValue(averageHeadway(headwaysData))}
        />
        <DataWidget
          title="Longest Headway"
          layoutKind="no-delta"
          analysis={`${dayjs(longestHeadway.service_date).format('MM/DD/YY')}`}
          isLarge={!lg}
          widgetValue={new TimeWidgetValue(longestHeadway.max)}
        />
      </WidgetCarousel>
    </div>
  );
};
