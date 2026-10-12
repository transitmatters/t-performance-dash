import React from 'react';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { FleetMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { ParamsType } from '../speed/constants/speeds';
import { FleetAgeChart } from './charts/FleetAgeChart';
import type { FleetMetric } from './constants/fleetTypes';
import { hasFleetMetric } from './constants/fleetTypes';

interface FleetAgeGraphWrapperProps {
  data: FleetMetrics[];
  metric: FleetMetric;
  showShuttling: boolean;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetAgeGraphWrapper: React.FC<FleetAgeGraphWrapperProps> = ({
  data,
  metric,
  showShuttling,
  config,
  startDate,
  endDate,
}) => {
  if (!data.some((datapoint) => hasFleetMetric(datapoint, metric.field))) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <ChartStack>
      <FleetAgeChart
        config={config}
        data={data}
        metric={metric}
        showShuttling={showShuttling}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
