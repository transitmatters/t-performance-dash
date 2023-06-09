import React from 'react';
import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import { convertToSpeedDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallSpeedChartProps {
  speedData: SpeedDataPoint[][];
}
export const OverallSpeedChart: React.FC<OverallSpeedChartProps> = ({ speedData }) => {
  const labels = speedData[0].map((point) => point.date);
  const datasets = speedData.map((data) => convertToSpeedDataset(data));

  return (
    <div className="h-[300px] w-full max-w-2xl px-16">
      <LandingPageChart datasets={datasets} labels={labels} id="system-speed" />
    </div>
  );
};
