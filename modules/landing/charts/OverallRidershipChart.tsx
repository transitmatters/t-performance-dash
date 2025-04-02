import React from 'react';
import type { RidershipCount } from '../../../common/types/dataPoints';
import { RidershipBaseline } from '../../../copy/landingCopy';
import type { Line as LineType } from '../../../common/types/lines';
import { convertToRidershipDataset, LANDING_CHART_LABELS } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';
import { LandingPageChart } from './LandingPageChart';

interface OverallRidershipChartProps {
  ridershipData: { [key in LineType]: RidershipCount[] };
}
export const OverallRidershipChart: React.FC<OverallRidershipChartProps> = ({ ridershipData }) => {
  const labels = LANDING_CHART_LABELS;
  const datasets = convertToRidershipDataset(ridershipData, labels);

  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-ridership" />
      {RidershipBaseline}
    </LandingChartDiv>
  );
};
