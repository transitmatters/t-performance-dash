import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useTripMetricsForLanding } from '../../../common/api/hooks/tripmetrics';
import { OverallFleetAgeChart } from './OverallFleetAgeChart';

export const OverallFleetAgeChartWrapper: React.FC = () => {
  const fleetData = useTripMetricsForLanding();
  const dataReady = !fleetData.isLoading && !fleetData.isError && fleetData.data;
  if (!dataReady) return <ChartPlaceHolder query={fleetData} />;

  return <OverallFleetAgeChart fleetData={fleetData.data} />;
};
