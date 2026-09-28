import React from 'react';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { DeliveredTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { ParamsType } from '../speed/constants/speeds';
import { FleetMixChart } from './charts/FleetMixChart';
import type { FleetType } from './constants/fleetTypes';
import { hasFleetMix } from './constants/fleetTypes';

interface FleetMixGraphWrapperProps {
  data: DeliveredTripMetrics[];
  types: FleetType[];
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetMixGraphWrapper: React.FC<FleetMixGraphWrapperProps> = ({
  data,
  types,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => hasFleetMix(datapoint, types))) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <ChartStack>
      <FleetMixChart
        config={config}
        data={data}
        types={types}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
