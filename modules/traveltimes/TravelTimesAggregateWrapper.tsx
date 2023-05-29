import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DataWidget } from '../../common/components/widgets/internal/DataWidget';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import { getTravelTimesAggregateWidgetData } from '../../common/utils/traveltimes';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

interface TravelTimesAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const TravelTimesAggregateWrapper: React.FC<TravelTimesAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const traveltimesData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  const { average, fastest, deltaWidgetValue } = getTravelTimesAggregateWidgetData(traveltimesData);
  return (
    <div className="flex flex-col gap-x-2 gap-y-2 pt-2 ">
      <WidgetCarousel>
        <DataWidget
          title=""
          layoutKind="no-delta"
          analysis={'Average'}
          widgetValue={new TimeWidgetValue(average)}
        />
        <DataWidget
          title=""
          analysis={'Over Period'}
          layoutKind="delta-and-percent-change"
          widgetValue={deltaWidgetValue}
        />
        <DataWidget
          title=""
          layoutKind="no-delta"
          analysis={`Fastest Trip (${dayjs(fastest.service_date).format('MM/DD/YY')})`}
          widgetValue={new TimeWidgetValue(fastest.min)}
        />
      </WidgetCarousel>
      <TravelTimesAggregateChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
        timeUnit={'by_date'}
      />
    </div>
  );
};
