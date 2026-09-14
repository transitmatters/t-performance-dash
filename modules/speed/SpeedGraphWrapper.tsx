import React from 'react';
import { ChartStack } from '../../common/components/charts/ChartStack';
import type { SpeedTripMetrics } from '../../common/types/dataPoints';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { SpeedGraph } from './charts/SpeedGraph';
import type { ParamsType } from './constants/speeds';

interface SpeedGraphWrapperProps {
  data: SpeedTripMetrics[];
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
    <ChartStack>
      <SpeedGraph config={config} data={data} startDate={startDate} endDate={endDate} />
    </ChartStack>
  );
};
