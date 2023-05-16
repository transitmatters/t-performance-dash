import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { DatapointWidgetPair } from '../../common/components/widgets/DatapointWidgetPair';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import type { AggregateDataPoint, AggregateDataResponse } from '../../common/types/charts';
import { averageTravelTime } from '../../common/utils/traveltimes';
import type { Station } from '../../common/types/stations';

interface TravelTimesAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  traveltimes: AggregateDataPoint[] | undefined;
  toStation: Station;
  fromStation: Station;
}

export const TravelTimesAggregateWrapper: React.FC<TravelTimesAggregateWrapperProps> = ({
  query,
  traveltimes,
  toStation,
  fromStation,
}) => {
  return (
    <div className="flex flex-col gap-x-2 gap-y-1 pt-2 md:flex-row md:pt-0">
      <DatapointWidgetPair>
        <BasicWidgetDataLayout
          title="Average"
          layoutKind="no-delta"
          analysis={'over period'}
          widgetValue={
            new TimeWidgetValue(
              traveltimes ? averageTravelTime(traveltimes.map((tt) => tt.mean)) : undefined
            )
          }
        />

        <BasicWidgetDataLayout
          title="Delta"
          analysis={''}
          layoutKind="delta-and-percent-change"
          widgetValue={
            new TimeWidgetValue(
              traveltimes?.[traveltimes.length - 1].mean,
              traveltimes?.[traveltimes.length - 1]?.mean - traveltimes?.[0]?.mean
            )
          }
        />
      </DatapointWidgetPair>

      <AggregateChartWrapper
        query={query}
        toStation={toStation}
        fromStation={fromStation}
        type={'traveltimes'}
        timeUnit={'by_date'}
      />
    </div>
  );
};
