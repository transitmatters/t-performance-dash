import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { ParamsType } from '../speed/constants/speeds';
import { FleetAgeChart } from './charts/FleetAgeChart';

interface FleetAgeGraphWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetAgeGraphWrapper: React.FC<FleetAgeGraphWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.avg_car_age !== undefined)) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <CarouselGraphDiv>
      <FleetAgeChart config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};
