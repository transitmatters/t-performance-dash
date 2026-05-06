import React from 'react';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { LandingChartDiv } from '../LandingChartDiv';
import { convertToFleetAgeDataset, LANDING_CHART_LABELS } from '../utils';
import { FleetAgeChart } from './FleetAgeChart';

interface OverallFleetAgeChartProps {
  fleetData: { [key in Line]?: DeliveredTripMetrics[] };
}
export const OverallFleetAgeChart: React.FC<OverallFleetAgeChartProps> = ({ fleetData }) => {
  const labels = LANDING_CHART_LABELS;
  const datasets = convertToFleetAgeDataset(fleetData, labels);
  return (
    <LandingChartDiv>
      <FleetAgeChart datasets={datasets} labels={labels} id="system-fleet-age" />
      <p className="text-center text-xs italic text-stone-900">Average car age in years</p>
    </LandingChartDiv>
  );
};
