import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetCarousel } from '../../common/components/widgets/WidgetCarousel';
import { DataWidget } from '../../common/components/widgets/internal/DataWidget';
import { DeltaTimeWidgetValue, TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import { averageTravelTime } from '../../common/utils/traveltimes';
import type { Station } from '../../common/types/stations';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
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
  const lg = !useBreakpoint('lg');
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const traveltimesData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  const fastestTrip = traveltimesData.reduce(
    (currentFastest, datapoint) =>
      datapoint.min < currentFastest.min ? datapoint : currentFastest,
    traveltimesData[0]
  );
  return (
    <div className="flex flex-col gap-x-2 gap-y-1 pt-2 lg:flex-row-reverse">
      <TravelTimesAggregateChart
        traveltimes={query.data}
        toStation={toStation}
        fromStation={fromStation}
        timeUnit={'by_date'}
      />
      <WidgetCarousel>
        <DataWidget
          title="Average"
          layoutKind="no-delta"
          analysis={'over period'}
          isLarge={!lg}
          widgetValue={new TimeWidgetValue(averageTravelTime(traveltimesData.map((tt) => tt.mean)))}
        />
        <DataWidget
          title="Delta"
          analysis={''}
          layoutKind="delta-and-percent-change"
          isLarge={!lg}
          widgetValue={
            new DeltaTimeWidgetValue(
              traveltimesData[traveltimesData.length - 1].mean,
              traveltimesData[traveltimesData.length - 1].mean - traveltimesData[0].mean
            )
          }
        />
        <DataWidget
          title="Fastest trip"
          layoutKind="no-delta"
          analysis={`${dayjs(fastestTrip.service_date).format('MM/DD/YY')}`}
          isLarge={!lg}
          widgetValue={new TimeWidgetValue(fastestTrip.min)}
        />
      </WidgetCarousel>
    </div>
  );
};
