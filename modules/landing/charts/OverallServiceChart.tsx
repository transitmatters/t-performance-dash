import React from 'react';
import { LandingBaseline } from '../LandingCopy';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { LandingChartDiv } from '../LandingChartDiv';
import { useHistoricalBaselines } from '../../../common/api/hooks/baselines';
import { convertToServiceDataset, LANDING_CHART_LABELS } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallServiceChartProps {
  serviceData: { [key in Line]?: DeliveredTripMetrics[] };
}
export const OverallServiceChart: React.FC<OverallServiceChartProps> = ({ serviceData }) => {
  const labels = LANDING_CHART_LABELS;
  const { data: baselines } = useHistoricalBaselines();
  const datasets = convertToServiceDataset(serviceData, labels, baselines);

  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-service" />
      <LandingBaseline />
    </LandingChartDiv>
  );
};
