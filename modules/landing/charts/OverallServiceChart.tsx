import React from 'react';
import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import { convertToServiceDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallServiceChartProps {
  serviceData: SpeedDataPoint[][];
}
export const OverallServiceChart: React.FC<OverallServiceChartProps> = ({ serviceData }) => {
  const labels = serviceData[0].map((point) => point.date);
  const datasets = serviceData.map((data) => convertToServiceDataset(data));

  return (
    <div className="h-[300px] w-full max-w-2xl px-16">
      <LandingPageChart datasets={datasets} labels={labels} id="system-service" />
    </div>
  );
};
