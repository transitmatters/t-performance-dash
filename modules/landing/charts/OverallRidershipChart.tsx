import React from 'react';
import { LandingBaseline } from '../LandingCopy';
import type { RidershipCount } from '../../../common/types/dataPoints';
import type { Line as LineType } from '../../../common/types/lines';
import { useHistoricalBaselines } from '../../../common/api/hooks/baselines';
import { convertToRidershipDataset, LANDING_CHART_LABELS } from '../utils';
import { LandingChartDiv } from '../LandingChartDiv';
import { LandingPageChart } from './LandingPageChart';

interface OverallRidershipChartProps {
  ridershipData: { [key in LineType]: RidershipCount[] };
}
export const OverallRidershipChart: React.FC<OverallRidershipChartProps> = ({ ridershipData }) => {
  const labels = LANDING_CHART_LABELS;
  const { data: baselines } = useHistoricalBaselines();
  const datasets = convertToRidershipDataset(ridershipData, labels, baselines);

  return (
    <LandingChartDiv>
      <LandingPageChart datasets={datasets} labels={labels} id="system-ridership" />
      <LandingBaseline />
    </LandingChartDiv>
  );
};
