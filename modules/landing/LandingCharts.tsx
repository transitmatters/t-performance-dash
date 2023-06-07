import React from 'react';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
import { OverallRidershipChartWrapper } from './charts/OverallRidershipChartWrapper';
import { LandingChartWidget } from './LandingChartWidget';
export const LandingCharts: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <LandingChartWidget title="Speed">
        <OverallSpeedChartWrapper />
      </LandingChartWidget>
      <LandingChartWidget title="Service">
        <OverallServiceChartWrapper />
      </LandingChartWidget>
      <LandingChartWidget title="Ridership">
        <OverallRidershipChartWrapper />
      </LandingChartWidget>
    </div>
  );
};
