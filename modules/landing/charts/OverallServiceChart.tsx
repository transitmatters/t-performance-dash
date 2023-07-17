import React from 'react';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { ServiceBaseline } from '../../../copy/landingCopy';
import { LandingChartDiv } from '../LandingChartDiv';
import { convertToServiceDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallServiceChartProps {
  serviceData: { [key in Line]?: DeliveredTripMetrics[] };
}
export const OverallServiceChart: React.FC<OverallServiceChartProps> = ({ serviceData }) => {
  const labels = Object.values(serviceData)[0].map((point) => point.date);
  const datasets = convertToServiceDataset(serviceData);

  return (
    <LandingChartDiv>
      {ServiceBaseline}
      <LandingPageChart datasets={datasets} labels={labels} id="system-service" />
    </LandingChartDiv>
  );
};
