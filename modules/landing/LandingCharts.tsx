import React from 'react';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
export const LandingCharts: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <OverallSpeedChartWrapper />
    </div>
  );
};
