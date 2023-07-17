import React from 'react';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { SpeedBaseline } from '../../../copy/landingCopy';
import type { Line } from '../../../common/types/lines';
import { LandingChartDiv } from '../LandingChartDiv';
import { convertToSpeedDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallSpeedChartProps {
  speedData: { [key in Line]?: DeliveredTripMetrics[] };
}
export const OverallSpeedChart: React.FC<OverallSpeedChartProps> = ({ speedData }) => {
  const labels = Object.values(speedData)[0].map((point) => point.date);
  const datasets = convertToSpeedDataset(speedData);
  return (
    <LandingChartDiv>
      {SpeedBaseline}
      <LandingPageChart datasets={datasets} labels={labels} id="system-speed" />
    </LandingChartDiv>
  );
};
