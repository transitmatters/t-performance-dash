import React from 'react';
import type { SpeedDataPoint } from '../../../common/types/dataPoints';
import { convertToSpeedDataset } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';
import { LandingPageChart } from './LandingPageChart';

interface OverallSpeedChartProps {
  speedData: SpeedDataPoint[][];
}
export const OverallSpeedChart: React.FC<OverallSpeedChartProps> = ({ speedData }) => {
  const labels = speedData[0].map((point) => point.date);
  const datasets = speedData.map((data) => convertToSpeedDataset(data));

  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-speed" />
    </LandingChartDiv>
  );
};
