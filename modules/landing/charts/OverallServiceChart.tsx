import React from 'react';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { ServiceBaseline } from '../../../copy/landingCopy';
import { LandingChartDiv } from '../LandingChartDiv';
import { convertToServiceDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallServiceChartProps {
  serviceData: DeliveredTripMetrics[][];
}
export const OverallServiceChart: React.FC<OverallServiceChartProps> = ({ serviceData }) => {
  const labels = serviceData[0].map((point) => point.date);
  const datasets = serviceData.map((data) => convertToServiceDataset(data));

  return (
    <LandingChartDiv>
      {ServiceBaseline}
      <LandingPageChart datasets={datasets} labels={labels} id="system-service" />
    </LandingChartDiv>
  );
};
