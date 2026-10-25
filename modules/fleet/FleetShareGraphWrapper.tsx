import type { FC } from 'react';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { FleetMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { ParamsType } from '../speed/constants/speeds';
import { FleetShareChart } from './charts/FleetShareChart';
import type { FleetModeMetrics } from './constants/fleetTypes';
import { hasFleetMetric } from './constants/fleetTypes';

interface FleetShareGraphWrapperProps {
  data: FleetMetrics[];
  metric: NonNullable<FleetModeMetrics['share']>;
  showShuttling: boolean;
  config: ParamsType;
  startDate: string;
  endDate: string;
}

export const FleetShareGraphWrapper: FC<FleetShareGraphWrapperProps> = ({
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
      <FleetShareChart
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
