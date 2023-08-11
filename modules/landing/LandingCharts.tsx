import React from 'react';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { TODAY_STRING } from '../../common/constants/dates';
import { OverallSpeedChartWrapper } from './charts/OverallSpeedChartWrapper';
import { OverallServiceChartWrapper } from './charts/OverallServiceChartWrapper';
import { OverallRidershipChartWrapper } from './charts/OverallRidershipChartWrapper';
import { LandingChartWidget } from './LandingChartWidget';

export const LandingCharts: React.FC = () => {
  // This query is just to get the lambdas "warm"
  useDeliveredTripMetrics({
    agg: 'daily',
    start_date: TODAY_STRING,
    end_date: TODAY_STRING,
    line: 'line-red',
  });
  return (
    <div className="flex flex-col items-center gap-8 lg:gap-12">
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
