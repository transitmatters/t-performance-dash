import React from 'react';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { SpeedBaseline } from '../../../copy/landingCopy';
import type { Line } from '../../../common/types/lines';
import { LandingChartDiv } from '../LandingChartDiv';
import { convertToSpeedDataset, LANDING_CHART_LABELS } from '../utils';
import { LandingPageChart } from './LandingPageChart';

interface OverallSpeedChartProps {
  speedData: { [key in Line]?: DeliveredTripMetrics[] };
}
export const OverallSpeedChart: React.FC<OverallSpeedChartProps> = ({ speedData }) => {
  const labels = LANDING_CHART_LABELS;
  const datasets = convertToSpeedDataset(speedData, labels);
  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-speed" />
      {SpeedBaseline}
    </LandingChartDiv>
  );
};
