import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { SpeedGraph } from './charts/SpeedGraph';
import type { ParamsType } from './constants/speeds';

interface SpeedGraphWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const SpeedGraphWrapper: React.FC<SpeedGraphWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const dataNoNulls = data.filter((datapoint) => datapoint.miles_covered);
  if (dataNoNulls.length < 1) return <NoDataNotice isLineMetric />;
  return (
    <CarouselGraphDiv>
      <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};
