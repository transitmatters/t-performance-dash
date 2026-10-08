import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { ParamsType } from '../speed/constants/speeds';
import { PctNewTrainsChart } from './charts/PctNewTrainsChart';

interface PctNewTrainsGraphWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const PctNewTrainsGraphWrapper: React.FC<PctNewTrainsGraphWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.pct_new_trips !== undefined)) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <CarouselGraphDiv>
      <PctNewTrainsChart config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};
