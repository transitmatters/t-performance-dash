import React from 'react';
import { TopLevelMetrics } from '../../copy/landingCopy';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
import { OverallRidershipChartWrapper } from './charts/OverallRidershipChartWrapper';
import { LandingChartWidget } from './LandingChartWidget';
export const LandingCharts: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full px-8 text-gray-100">{TopLevelMetrics}</div>
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
