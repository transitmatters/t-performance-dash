import React from 'react';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { ServiceGraph } from './ServiceGraph';

interface ServiceGraphWrapperProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

// The average/peak KPIs now live in the page's stat-card row (see ServiceDetails), so the chart
// no longer carries an in-plot carousel value — just the graph.
export const ServiceGraphWrapper: React.FC<ServiceGraphWrapperProps> = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.miles_covered)) return <NoDataNotice isLineMetric />;

  return (
    <CarouselGraphDiv>
      <ServiceGraph
        config={config}
        data={data}
        startDate={startDate}
        endDate={endDate}
        predictedData={predictedData}
      />
    </CarouselGraphDiv>
  );
};
