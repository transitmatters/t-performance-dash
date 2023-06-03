import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { WidgetForCarousel } from '../../common/components/widgets/internal/WidgetForCarousel';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import type { AggregateDataResponse } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetCarousel } from '../../common/components/general/WidgetCarousel';
import { SMALL_DATE_FORMAT } from '../../common/constants/dates';
import { getDwellsAggregateWidgetData } from '../../common/utils/dwells';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

interface DwellsAggregateWrapperProps {
  query: UseQueryResult<AggregateDataResponse>;
  toStation: Station;
  fromStation: Station;
}

export const DwellsAggregateWrapper: React.FC<DwellsAggregateWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  const headwaysData = query.data.by_date.filter((datapoint) => datapoint.peak === 'all');
  const { average, max } = getDwellsAggregateWidgetData(headwaysData);
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
          analysis={`Longest Dwell (on ${dayjs(max.service_date).format(SMALL_DATE_FORMAT)})`}
          widgetValue={new TimeWidgetValue(max.max)}
        />
      </WidgetCarousel>
      <DwellsAggregateChart dwells={query.data} toStation={toStation} fromStation={fromStation} />
    </div>
  );
};
