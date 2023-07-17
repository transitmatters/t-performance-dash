import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useTripMetricsForLanding } from '../../../common/api/hooks/tripmetrics';
import { OverallSpeedChart } from './OverallSpeedChart';

export const OverallSpeedChartWrapper: React.FC = () => {
  const speedData = useTripMetricsForLanding();
  const speedDataReady = !speedData.isLoading && !speedData.isError;
  if (!speedDataReady) return <ChartPlaceHolder query={speedData} />;

  return <OverallSpeedChart speedData={speedData.data} />;
};
