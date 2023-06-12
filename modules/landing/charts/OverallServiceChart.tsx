import React from 'react';
import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import { convertToServiceDataset } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';
import { ServiceBaseline } from '../../../copy/landingCopy';
import { LandingPageChart } from './LandingPageChart';

interface OverallServiceChartProps {
  serviceData: SpeedDataPoint[][];
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
