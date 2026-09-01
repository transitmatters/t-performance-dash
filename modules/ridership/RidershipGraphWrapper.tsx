import React from 'react';
import type { RidershipCount } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../common/types/lines';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { RidershipGraph } from './RidershipGraph';

interface RidershipGraphWrapperProps {
  data: RidershipCount[];
  line?: Line;
  busRoute?: BusRoute | undefined;
  crRoute?: CommuterRailRoute | undefined;
  ferryRoute?: FerryRoute | undefined;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

// The average/percentage/peak KPIs now live in the page's stat-card row (see RidershipDetails), so
// the chart no longer carries an in-plot carousel value — just the graph.
export const RidershipGraphWrapper: React.FC<RidershipGraphWrapperProps> = ({
  data,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => datapoint.count !== null)) return <NoDataNotice isLineMetric />;

  return (
    <CarouselGraphDiv>
      <RidershipGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </CarouselGraphDiv>
  );
};
