import React from 'react';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { FleetAgeChart } from './charts/FleetAgeChart';
import { PctNewTrainsChart } from './charts/PctNewTrainsChart';
import type { ParamsType } from '../speed/constants/speeds';

interface FleetGraphWrapperProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetGraphWrapper: React.FC<FleetGraphWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  const dataWithFleetMetrics = data.filter(
    (datapoint) => datapoint.avg_car_age !== undefined || datapoint.pct_new_trips !== undefined
  );
  if (dataWithFleetMetrics.length < 1) return <NoDataNotice isLineMetric />;
  return (
    <CarouselGraphDiv>
      <PctNewTrainsChart config={config} data={data} startDate={startDate} endDate={endDate} />
      <FleetAgeChart config={config} data={data} startDate={startDate} endDate={endDate} />
      <p className="mt-2 text-sm text-stone-500">
        Based on a representative sample of trips per day, not a full census of the line, so
        expect some day-to-day noise.
      </p>
    </CarouselGraphDiv>
  );
};
