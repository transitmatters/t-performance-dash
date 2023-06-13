import React from 'react';
import type { RidershipCount } from '../../../common/types/dataPoints';
import type { Line as LineType } from '../../../common/types/lines';
import { convertToRidershipDataset } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';
import { LandingPageChart } from './LandingPageChart';

interface OverallRidershipChartProps {
  ridershipData: { line: LineType; data: RidershipCount[] }[];
}
export const OverallRidershipChart: React.FC<OverallRidershipChartProps> = ({ ridershipData }) => {
  const labels = ridershipData[0].data.map((point) => point.date);
  const datasets = ridershipData.map((item) => convertToRidershipDataset(item.data, item.line));

  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-ridership" />
    </LandingChartDiv>
  );
};
