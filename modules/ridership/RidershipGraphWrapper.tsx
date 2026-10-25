import React, { useMemo } from 'react';
import type { RidershipCount } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../common/types/lines';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getMinMaxDatesForRoute } from '../../common/utils/stations';
import { getServiceDatesBlockAnnotations } from '../service/utils/graphUtils';
import { RidershipGraph } from './RidershipGraph';
import { getOutOfServiceMessage } from './utils/utils';

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
  busRoute,
  crRoute,
  config,
  startDate,
  endDate,
}) => {
  const { tab } = useDelimitatedRoute();
  const { minDate: serviceStart, maxDate: serviceEnd } = getMinMaxDatesForRoute(
    tab,
    busRoute ?? crRoute
  );
  const serviceDateBlocks = useMemo(
    () => getServiceDatesBlockAnnotations(startDate, endDate, serviceStart, serviceEnd),
    [startDate, endDate, serviceStart, serviceEnd]
  );
  if (!data.some((datapoint) => datapoint.count !== null))
    return (
      <NoDataNotice
        isLineMetric
        message={getOutOfServiceMessage(startDate, endDate, serviceStart, serviceEnd)}
      />
    );

  return (
    <ChartStack>
      <RidershipGraph
        config={config}
        data={data}
        startDate={startDate}
        endDate={endDate}
        serviceEnd={serviceEnd}
        serviceDateBlocks={serviceDateBlocks}
      />
    </ChartStack>
  );
};
