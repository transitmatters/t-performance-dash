import React from 'react';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
export const LandingCharts: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <OverallSpeedChartWrapper />
      <OverallServiceChartWrapper />
    </div>
  );
};
